"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useSyncExternalStore,
  type FormEvent,
  type ChangeEvent,
} from "react";
import {
  EVENT,
  TRACK_DETAILS,
  SIZES,
  type SizeKey,
  MASCOTS,
  DEFAULT_MASCOT_ID,
  type MascotId,
  getMascotConfig,
} from "@/lib/config";
import {
  STYLE_OPTIONS,
  type StyleKey,
  renderPass,
  renderBasePass,
  resolveParticipantData,
  exportPassToBlob,
  downloadBlob,
  copyPassImageToClipboard,
  copyTextToClipboard,
  generateCaption,
  generateAltText,
} from "@/lib/pass";
import {
  preloadAllMascotsIdle,
  addMascotImageErrorListener,
  ensureMascotLoaded,
} from "@/lib/mascotImage";


/* ────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────── */

type LookupStatus = "idle" | "loading" | "success" | "error" | "rate-limited";

type ActionType =
  | "download-one"
  | "download-all"
  | "copy-image"
  | "copy-caption"
  | "copy-alt"
  | "share"
  | null;

interface ActionNotice {
  type: "info" | "success" | "error";
  message: string;
}

interface LookupResult {
  name: string;
  team: string;
  teamId: string;
  track: number;
  role: string;
  members: number;
  idea: string;
  number?: number;
}

/* ────────────────────────────────────────────────
   Browser Capabilities
   ──────────────────────────────────────────────── */

function emptySubscribe() {
  return () => {};
}

function getCanShareSnapshot(): boolean {
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  ) {
    try {
      const dummyFile = new File([""], "pass.png", { type: "image/png" });
      return navigator.canShare({ files: [dummyFile] });
    } catch {
      return false;
    }
  }
  return false;
}

function getServerCanShareSnapshot(): boolean {
  return false;
}

/* ────────────────────────────────────────────────
   Page component
   ──────────────────────────────────────────────── */

export default function StudioPage() {
  // Lookup state
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [teamId, setTeamId] = useState("");
  const [track, setTrack] = useState<number>(0);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [github, setGithub] = useState("");

  // Pass customization state
  const [selectedStyle, setSelectedStyle] = useState<StyleKey>("night");
  const [selectedSize, setSelectedSize] = useState<SizeKey>("pass");
  const [selectedMascot, setSelectedMascot] = useState<MascotId>(DEFAULT_MASCOT_ID);

  // Mascot rendering & notice state
  const [mascotVersion, setMascotVersion] = useState(0);
  const [mascotNotice, setMascotNotice] = useState<string | null>(null);


  // Email reference for the unlocked participant
  const [unlockedEmail, setUnlockedEmail] = useState("");

  // Export & Share state
  const [isExporting, setIsExporting] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);
  const canShare = useSyncExternalStore(
    emptySubscribe,
    getCanShareSnapshot,
    getServerCanShareSnapshot
  );

  // Canvases & preview tilt ref
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardWrapperRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<{ [K in StyleKey]?: HTMLCanvasElement | null }>({});


  // Preview interactive pointer tilt & sheen state
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [sheenStyle, setSheenStyle] = useState<React.CSSProperties>({});

  const isUnlocked = status === "success" && lookupResult !== null;

  // Auto-dismiss success notices after 4.5 seconds
  useEffect(() => {
    if (actionNotice && actionNotice.type === "success") {
      const timer = setTimeout(() => {
        setActionNotice(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [actionNotice]);

  /* ──────────── Participant data resolution ──────────── */

  const participantData = resolveParticipantData(
    isUnlocked,
    {
      name: isUnlocked ? name : "",
      team: isUnlocked ? team : "",
      teamId: isUnlocked ? teamId : "",
      track,
      role: lookupResult?.role || "Team Leader",
      ideaTitle,
      github,
      number: lookupResult?.number,
    },
    unlockedEmail,
    selectedMascot
  );

  /* ──────────── Eager Mascot Image Preloading ──────────── */

  useEffect(() => {
    ensureMascotLoaded(selectedMascot, "full", "small").then(() => {
      setMascotVersion((v) => v + 1);
    });
    ensureMascotLoaded(selectedMascot, "full", "large").then(() => {
      setMascotVersion((v) => v + 1);
    });
    preloadAllMascotsIdle();

    // Listen for image load failures to gracefully notify the user
    const unsubscribe = addMascotImageErrorListener(() => {
      setMascotNotice(
        "Mascot image failed to load. A fallback badge is displayed."
      );
    });

    return () => unsubscribe();
  }, [selectedMascot]);


  /* ──────────── Canvas Rendering ──────────── */

  const renderFrameId = useRef<number | null>(null);

  const drawAllCanvases = useCallback(() => {
    // 1. Draw main preview canvas
    const mainCanvas = mainCanvasRef.current;
    if (mainCanvas) {
      const sizeDef = SIZES[selectedSize];
      if (mainCanvas.width !== sizeDef.width || mainCanvas.height !== sizeDef.height) {
        mainCanvas.width = sizeDef.width;
        mainCanvas.height = sizeDef.height;
      }
      const ctx = mainCanvas.getContext("2d");
      if (ctx) {
        renderPass(ctx, participantData, selectedStyle, selectedSize);
      }
    }

    // 2. Draw all 4 style thumbnails (landscape base pass 1920×1080 rendered to 480×270)
    for (const opt of STYLE_OPTIONS) {
      const thumbCanvas = thumbRefs.current[opt.key];
      if (thumbCanvas) {
        if (thumbCanvas.width !== 480 || thumbCanvas.height !== 270) {
          thumbCanvas.width = 480;
          thumbCanvas.height = 270;
        }
        const thumbCtx = thumbCanvas.getContext("2d");
        if (thumbCtx) {
          renderBasePass(thumbCtx, participantData, opt.key, 480, 270);
        }
      }
    }
  }, [participantData, selectedStyle, selectedSize]);


  // Request animation frame for smooth, non-blocking live preview
  useEffect(() => {
    if (renderFrameId.current !== null) {
      cancelAnimationFrame(renderFrameId.current);
    }

    // Ensure fonts are loaded before initial draw
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        renderFrameId.current = requestAnimationFrame(drawAllCanvases);
      });
    } else {
      renderFrameId.current = requestAnimationFrame(drawAllCanvases);
    }

    return () => {
      if (renderFrameId.current !== null) {
        cancelAnimationFrame(renderFrameId.current);
      }
    };
  }, [drawAllCanvases, mascotVersion]);

  /* ──────────── Lookup handler ──────────── */

  const handleLookup = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      const trimmed = email.trim();
      if (!trimmed) return;

      setStatus("loading");

      try {
        const res = await fetch("/api/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });

        if (res.status === 429) {
          setStatus("rate-limited");
          setLookupResult(null);
          return;
        }

        const data = await res.json();

        if (data.found) {
          setLookupResult(data as LookupResult);
          setName(data.name);
          setTeam(data.team);
          setTeamId(data.teamId);
          setTrack(data.track);
          setIdeaTitle(data.idea ?? "");
          setGithub("");
          setStatus("success");
          setUnlockedEmail(trimmed.toLowerCase());
        } else {
          setLookupResult(null);
          setStatus("error");
        }
      } catch {
        setLookupResult(null);
        setStatus("error");
      }
    },
    [email]
  );

  /* ──────────── Email change handler ──────────── */

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setEmail(newVal);

      // Re-lock and reset to placeholder if email changes after unlock
      if (
        isUnlocked &&
        newVal.trim().toLowerCase() !== unlockedEmail
      ) {
        setStatus("idle");
        setLookupResult(null);
        setName("");
        setTeam("");
        setTeamId("");
        setTrack(0);
        setIdeaTitle("");
        setGithub("");
        setUnlockedEmail("");
        setActionNotice(null);
      }
    },
    [isUnlocked, unlockedEmail]
  );

  /* ──────────── GitHub handle — strip leading @ ──────────── */

  const handleGithubChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGithub(val.replace(/^@+/, ""));
  }, []);

  /* ──────────── Export & Sharing Actions ──────────── */

  const handleDownloadCurrent = useCallback(async () => {
    if (isExporting || !isUnlocked) return;
    setIsExporting(true);
    setActiveAction("download-one");
    setActionNotice({
      type: "info",
      message: `Preparing ${SIZES[selectedSize].label} pass…`,
    });

    try {
      const { blob, filename } = await exportPassToBlob(
        participantData,
        selectedStyle,
        selectedSize
      );
      downloadBlob(blob, filename);
      setActionNotice({
        type: "success",
        message: `✓ Downloaded ${filename}`,
      });
    } catch (err: unknown) {
      console.error("Export error:", err);
      setActionNotice({
        type: "error",
        message: "Failed to download pass. Please try again.",
      });
    } finally {
      setIsExporting(false);
      setActiveAction(null);
    }
  }, [isExporting, isUnlocked, participantData, selectedStyle, selectedSize]);

  const handleDownloadAllSizes = useCallback(async () => {
    if (isExporting || !isUnlocked) return;
    setIsExporting(true);
    setActiveAction("download-all");
    const allKeys = Object.keys(SIZES) as SizeKey[];
    setActionNotice({
      type: "info",
      message: `Starting export for all ${allKeys.length} sizes…`,
    });

    try {
      // Ensure fonts and mascot are prepared once before the batch
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }
      if (participantData.mascotId) {
        await ensureMascotLoaded(participantData.mascotId, "full", "large");
      }

      for (let i = 0; i < allKeys.length; i++) {
        const sizeKey = allKeys[i];
        const sizeDef = SIZES[sizeKey];
        setActionNotice({
          type: "info",
          message: `Exporting size ${i + 1} of ${allKeys.length} (${sizeDef.label})…`,
        });

        const { blob, filename } = await exportPassToBlob(
          participantData,
          selectedStyle,
          sizeKey
        );
        downloadBlob(blob, filename);

        // Spacing between downloads so browsers don't block rapid bursts
        if (i < allKeys.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      setActionNotice({
        type: "success",
        message: "✓ All 4 pass sizes downloaded!",
      });
    } catch (err: unknown) {
      console.error("Batch export error:", err);
      setActionNotice({
        type: "error",
        message:
          "Download was interrupted. If your browser blocked multiple downloads, please allow them and try again.",
      });
    } finally {
      setIsExporting(false);
      setActiveAction(null);
    }
  }, [isExporting, isUnlocked, participantData, selectedStyle]);

  const handleCopyImage = useCallback(async () => {
    if (isExporting || !isUnlocked) return;
    setIsExporting(true);
    setActiveAction("copy-image");
    setActionNotice({
      type: "info",
      message: "Preparing pass image for clipboard…",
    });

    try {
      const { blob } = await exportPassToBlob(
        participantData,
        selectedStyle,
        selectedSize
      );
      const res = await copyPassImageToClipboard(blob);
      setActionNotice({
        type: res.success ? "success" : "error",
        message: res.message,
      });
    } catch (err: unknown) {
      console.error("Copy image error:", err);
      setActionNotice({
        type: "error",
        message: "Could not copy image. Please use 'Download PNG' instead.",
      });
    } finally {
      setIsExporting(false);
      setActiveAction(null);
    }
  }, [isExporting, isUnlocked, participantData, selectedStyle, selectedSize]);

  const handleCopyCaption = useCallback(async () => {
    if (isExporting || !isUnlocked) return;
    setIsExporting(true);
    setActiveAction("copy-caption");

    try {
      const caption = generateCaption(participantData);
      const res = await copyTextToClipboard(caption);
      setActionNotice({
        type: res.success ? "success" : "error",
        message: res.message,
      });
    } catch (err: unknown) {
      console.error("Copy caption error:", err);
      setActionNotice({
        type: "error",
        message: "Could not copy caption to clipboard.",
      });
    } finally {
      setIsExporting(false);
      setActiveAction(null);
    }
  }, [isExporting, isUnlocked, participantData]);

  const handleShare = useCallback(async () => {
    if (isExporting || !isUnlocked) return;
    setIsExporting(true);
    setActiveAction("share");
    setActionNotice({
      type: "info",
      message: "Preparing pass to share…",
    });

    try {
      const { blob, filename } = await exportPassToBlob(
        participantData,
        selectedStyle,
        selectedSize
      );
      const file = new File([blob], filename, { type: "image/png" });
      const caption = generateCaption(participantData);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${participantData.name}'s Builder Pass`,
          text: caption,
        });
        setActionNotice({
          type: "success",
          message: "Pass shared!",
        });
      } else {
        setActionNotice({
          type: "error",
          message:
            "File sharing is not supported on this device. Use 'Download PNG' instead.",
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setActionNotice(null);
      } else {
        console.error("Share error:", err);
        setActionNotice({
          type: "error",
          message: "Share could not be completed. Use 'Download PNG' instead.",
        });
      }
    } finally {
      setIsExporting(false);
      setActiveAction(null);
    }
  }, [isExporting, isUnlocked, participantData, selectedStyle, selectedSize]);

  /* ──────────── Copy Alt Text for Screen Readers ──────────── */

  const handleCopyAltText = useCallback(async () => {
    if (isExporting || !isUnlocked) return;
    setIsExporting(true);
    setActiveAction("copy-alt");

    try {
      const altText = generateAltText({
        name: participantData.name,
        role: participantData.role,
        team: participantData.team,
        teamId: participantData.teamId,
        track: participantData.track,
        ideaTitle: participantData.ideaTitle,
        github: participantData.github,
        mascotId: participantData.mascotId,
        passId: participantData.passId,
      });
      const res = await copyTextToClipboard(altText);
      setActionNotice({
        type: res.success ? "success" : "error",
        message: res.success
          ? "Alt text copied! Ready to paste into image description."
          : res.message,
      });
    } catch (err: unknown) {
      console.error("Copy alt text error:", err);
      setActionNotice({
        type: "error",
        message: "Could not copy alt text to clipboard.",
      });
    } finally {
      setIsExporting(false);
      setActiveAction(null);
    }
  }, [isExporting, isUnlocked, participantData]);

  /* ──────────── Interactive Preview Tilt & Sheen ──────────── */

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const el = cardWrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTiltStyle({
      transform: `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
    });

    const sheenX = ((x / rect.width) * 100).toFixed(1);
    const sheenY = ((y / rect.height) * 100).toFixed(1);
    setSheenStyle({
      opacity: 0.4,
      background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 255, 255, 0) 70%)`,
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTiltStyle({ transform: "rotateX(0deg) rotateY(0deg)" });
    setSheenStyle({ opacity: 0 });
  }, []);

  /* ──────────── Status message ──────────── */

  function statusMessage(): string {
    switch (status) {
      case "idle":
        return "Enter your registered email to unlock your personal pass.";
      case "loading":
        return "Looking you up…";
      case "success": {
        if (!lookupResult) return "";
        const memberWord = lookupResult.members === 1 ? "member" : "members";
        return `✓ Found you — ${lookupResult.role} of ${lookupResult.team} · ${lookupResult.members} ${memberWord}`;
      }
      case "error":
        return "No registration found for that email. Use the email you registered with.";
      case "rate-limited":
        return "Too many tries. Wait a minute.";
      default:
        return "";
    }
  }

  /* ──────────── Render ──────────── */

  return (
    <div className="studio-shell">
      {/* Top Navbar with NEXWIN Brand Lockup & Binary Texture */}
      <header className="binary-texture-header">
        <div className="studio-topbar">
          <div className="studio-topbar__brand-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="NEXWIN Logo"
              className="studio-topbar__logo"
              width={38}
              height={38}
            />
            <div className="studio-topbar__titles">
              <span className="studio-topbar__name">{EVENT.name}</span>
              <span className="studio-topbar__by">Builder Pass Studio</span>
            </div>
          </div>
        </div>
      </header>

      <div className="studio-body">
        {/* ─── Form panel ─── */}
        <section
          className="studio-form-panel"
          aria-label="Pass customisation form"
        >
          {/* Hero title */}
          <div className="studio-hero">
            <h1 className="studio-hero__title">
              Make your
              <br />
              <span className="studio-hero__highlight">builder pass.</span>
            </h1>
          </div>

          {/* Registered Email & Lookup */}
          <form onSubmit={handleLookup} className="field-group">
            <div className="field">
              <label htmlFor="lookup-email" className="field__label">
                REGISTERED EMAIL
              </label>
              <div className="email-input-wrapper">
                <input
                  id="lookup-email"
                  type="email"
                  className="field__input email-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  aria-describedby="status-line"
                />
                <button
                  type="submit"
                  className="btn btn--lookup"
                  disabled={status === "loading" || !email.trim()}
                  aria-label="Look up registration"
                >
                  {status === "loading" ? (
                    <>
                      <span
                        className="spinner spinner--sm"
                        aria-hidden="true"
                      />
                      <span>Checking…</span>
                    </>
                  ) : (
                    "Find me"
                  )}
                </button>
              </div>
            </div>

            {/* Status line */}
            <div
              id="status-line"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`status-line status-line--${status}`}
            >
              {statusMessage()}
            </div>
          </form>

          {/* User details */}
          <div className="field-group">
            <div className="field">
              <label htmlFor="field-name" className="field__label">
                YOUR NAME
              </label>
              <input
                id="field-name"
                type="text"
                className={`field__input${isUnlocked ? " field__input--readonly" : ""}`}
                value={name}
                readOnly={isUnlocked}
                disabled={!isUnlocked}
                tabIndex={isUnlocked ? -1 : 0}
                aria-readonly={isUnlocked}
                placeholder="Alex Morgan"
              />
            </div>

            <div className="field">
              <div className="field__label-row">
                <label htmlFor="field-idea" className="field__label">
                  IDEA TITLE
                </label>
                <span id="idea-hint" className="field__hint">
                  {ideaTitle.length}/60
                </span>
              </div>
              <input
                id="field-idea"
                type="text"
                className="field__input"
                placeholder="What are you building?"
                maxLength={60}
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                disabled={!isUnlocked}
                aria-describedby="idea-hint"
              />
            </div>

            <div className="field">
              <label htmlFor="field-github" className="field__label">
                GITHUB
              </label>
              <input
                id="field-github"
                type="text"
                className="field__input"
                placeholder="username"
                value={github}
                onChange={handleGithubChange}
                disabled={!isUnlocked}
              />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="field-track" className="field__label">
                  TRACK
                </label>
                <div className="select-wrapper">
                  <select
                    id="field-track"
                    className="field__select"
                    value={track}
                    onChange={(e) => setTrack(Number(e.target.value))}
                    disabled={!isUnlocked}
                  >
                    {TRACK_DETAILS.map((t, i) => (
                      <option key={t.id} value={i}>
                        {t.label}: {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="field-team" className="field__label">
                  TEAM
                </label>
                <input
                  id="field-team"
                  type="text"
                  className={`field__input${isUnlocked ? " field__input--readonly" : ""}`}
                  value={team}
                  readOnly={isUnlocked}
                  disabled={!isUnlocked}
                  tabIndex={isUnlocked ? -1 : 0}
                  aria-readonly={isUnlocked}
                  placeholder="CyberCraft"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="field-team-id" className="field__label">
                TEAM ID
              </label>
              <input
                id="field-team-id"
                type="text"
                className={`field__input${isUnlocked ? " field__input--readonly" : ""}`}
                value={teamId}
                readOnly={isUnlocked}
                disabled={!isUnlocked}
                tabIndex={isUnlocked ? -1 : 0}
                aria-readonly={isUnlocked}
                placeholder="CC-042"
              />
            </div>
          </div>

          <hr className="form-divider" />

          {/* Mascot Picker */}
          <div className="form-section">
            <h2 className="field__label" style={{ marginBottom: "0.75rem" }}>
              MASCOT
            </h2>

            {mascotNotice && (
              <div className="notice-banner" role="status" aria-live="polite">
                {mascotNotice}
              </div>
            )}

            <div
              className="mascot-grid"
              role="radiogroup"
              aria-label="Mascot selection"
            >
              {MASCOTS.map((m) => {
                const isSelected = selectedMascot === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`mascot-tile ${isSelected ? "mascot-tile--active" : ""}`}
                    onClick={() => {
                      setSelectedMascot(m.id as MascotId);
                      ensureMascotLoaded(m.id, "full", "large").then(() => {
                        setMascotVersion((v) => v + 1);
                      });
                    }}
                    aria-label={`${m.name} mascot — ${m.tagline}`}
                  >
                    <div
                      className="mascot-tile__canvas-wrap"
                      style={{
                        background: `linear-gradient(135deg, ${m.theme.gradient[0]}, ${m.theme.gradient[1]})`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.images.bustSmall}
                        alt=""
                        className="mascot-tile__canvas"
                        width={80}
                        height={80}
                        loading="eager"
                      />
                      {isSelected && (
                        <div className="mascot-tile__check" aria-hidden="true">
                          ✓
                        </div>
                      )}
                    </div>
                    <span className="mascot-tile__name">{m.name}</span>
                  </button>
                );
              })}
            </div>

          </div>

          <hr className="form-divider" />

          {/* Style Picker */}
          <div className="form-section">
            <h2 className="field__label" style={{ marginBottom: "0.75rem" }}>
              STYLE
            </h2>
            <div
              className="style-grid"
              role="radiogroup"
              aria-label="Pass style selection"
            >
              {STYLE_OPTIONS.map((opt) => {
                const isSelected = selectedStyle === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`style-tile ${isSelected ? "style-tile--active" : ""}`}
                    onClick={() => setSelectedStyle(opt.key)}
                  >
                    <div className="style-tile__canvas-wrap">
                      <canvas
                        ref={(el) => {
                          thumbRefs.current[opt.key] = el;
                        }}
                        className="style-tile__canvas"
                        width={480}
                        height={270}
                        aria-hidden="true"
                      />
                      {isSelected && (
                        <div className="style-tile__check" aria-hidden="true">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="style-tile__info">
                      <span className="style-tile__name">{opt.label}</span>
                      <span className="style-tile__desc">{opt.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Preview panel ─── */}
        <section
          className="studio-preview-panel"
          aria-label="Pass preview panel"
        >
          <div className="studio-dark-card">
            {/* Size tabs */}
            <div
              className="size-tabs"
              role="tablist"
              aria-label="Pass export sizes"
            >
              {(Object.keys(SIZES) as SizeKey[]).map((key) => {
                const sizeDef = SIZES[key];
                const isActive = selectedSize === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`size-tab ${isActive ? "size-tab--active" : ""}`}
                    onClick={() => setSelectedSize(key)}
                  >
                    {sizeDef.label}
                  </button>
                );
              })}
            </div>

            {/* Canvas Stage with gentle pointer tilt & light sheen */}
            <div className="preview-stage">
              <div
                ref={cardWrapperRef}
                className="preview-card-wrapper"
                style={tiltStyle}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              >
                <canvas
                  ref={mainCanvasRef}
                  className="preview-canvas"
                  width={SIZES[selectedSize].width}
                  height={SIZES[selectedSize].height}
                  aria-label={`Builder pass preview for ${participantData.name} in ${selectedStyle} style with ${getMascotConfig(selectedMascot).name} mascot`}
                />
                <div
                  className="preview-sheen"
                  style={sheenStyle}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="export-action-bar" aria-label="Pass export actions">
              {/* Primary: Download PNG */}
              <button
                type="button"
                className="btn btn--download-primary"
                disabled={!isUnlocked || isExporting}
                aria-disabled={!isUnlocked || isExporting}
                onClick={handleDownloadCurrent}
                aria-label={`Download pass PNG for ${SIZES[selectedSize].label} size`}
              >
                {activeAction === "download-one" ? (
                  <>
                    <span
                      className="spinner spinner--dark"
                      aria-hidden="true"
                    />
                    <span>Preparing…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download PNG</span>
                  </>
                )}
              </button>

              {/* All sizes */}
              <button
                type="button"
                className="btn btn--dark-pill"
                disabled={!isUnlocked || isExporting}
                aria-disabled={!isUnlocked || isExporting}
                onClick={handleDownloadAllSizes}
                aria-label="Download all four pass sizes sequentially"
              >
                {activeAction === "download-all" ? (
                  <>
                    <span className="spinner spinner--sm" aria-hidden="true" />
                    <span>Exporting…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>All sizes</span>
                  </>
                )}
              </button>

              {/* Copy image */}
              <button
                type="button"
                className="btn btn--dark-pill"
                disabled={!isUnlocked || isExporting}
                aria-disabled={!isUnlocked || isExporting}
                onClick={handleCopyImage}
                aria-label="Copy pass image directly to system clipboard"
              >
                {activeAction === "copy-image" ? (
                  <>
                    <span className="spinner spinner--sm" aria-hidden="true" />
                    <span>Copying…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy image</span>
                  </>
                )}
              </button>

              {/* Copy caption */}
              <button
                type="button"
                className="btn btn--dark-pill"
                disabled={!isUnlocked || isExporting}
                aria-disabled={!isUnlocked || isExporting}
                onClick={handleCopyCaption}
                aria-label="Copy ready-to-post social caption to clipboard"
              >
                {activeAction === "copy-caption" ? (
                  <>
                    <span className="spinner spinner--sm" aria-hidden="true" />
                    <span>Copying…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="17" y1="10" x2="3" y2="10" />
                      <line x1="21" y1="6" x2="3" y2="6" />
                      <line x1="21" y1="14" x2="3" y2="14" />
                      <line x1="17" y1="18" x2="3" y2="18" />
                    </svg>
                    <span>Copy caption</span>
                  </>
                )}
              </button>

              {/* Copy alt text for screen readers */}
              <button
                type="button"
                className="btn btn--dark-pill"
                disabled={!isUnlocked || isExporting}
                aria-disabled={!isUnlocked || isExporting}
                onClick={handleCopyAltText}
                aria-label="Copy accessible pass description for screen readers"
              >
                {activeAction === "copy-alt" ? (
                  <>
                    <span className="spinner spinner--sm" aria-hidden="true" />
                    <span>Copying…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>Copy alt text</span>
                  </>
                )}
              </button>

              {/* Share button (if supported) */}
              {canShare && (
                <button
                  type="button"
                  className="btn btn--dark-pill"
                  disabled={!isUnlocked || isExporting}
                  aria-disabled={!isUnlocked || isExporting}
                  onClick={handleShare}
                  aria-label="Share pass using device system share sheet"
                >
                  {activeAction === "share" ? (
                    <>
                      <span
                        className="spinner spinner--sm"
                        aria-hidden="true"
                      />
                      <span>Sharing…</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      <span>Share</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Action Notice inside dark card */}
            {actionNotice && (
              <div
                role="status"
                aria-live="polite"
                className={`action-notice action-notice--${actionNotice.type}`}
              >
                {actionNotice.message}
              </div>
            )}

            {!isUnlocked && (
              <div className="export-locked-hint" aria-hidden="true">
                🔒 Enter your registered email and click Find me to unlock
                download & share actions
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Minimal Footer */}
      <footer className="studio-footer" role="contentinfo">
        <p>
          {EVENT.name} Builder Pass Studio · Organised by {EVENT.organizer}
        </p>
      </footer>
    </div>
  );
}
