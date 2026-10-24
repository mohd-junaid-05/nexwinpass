"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { EVENT } from "@/lib/config";
import {
  CERTIFICATE_TEMPLATES,
  CERTIFICATE_SUPPORT,
  IS_REQUIRE_TEAM_ID_ENABLED,
  renderCertificate,
  preloadTemplateImage,
  exportCertificateToBlob,
  downloadCertificateBlob,
  generateCertificateCaption,
  type CertificateType,
  type ParticipantCertificateData,
} from "@/lib/certificates";
import { copyTextToClipboard } from "@/lib/pass/export";

type LookupStatus = "idle" | "loading" | "success" | "error" | "rate-limited";

interface LookupResult {
  name: string;
  team: string;
  teamId: string;
  track: number;
  role: string;
  members: number;
  idea: string;
  number?: number;
  certificates?: {
    participation: {
      eligible: boolean;
      id: string | null;
    };
    completion: {
      eligible: boolean;
      id: string | null;
    };
  };
}

interface CertificatesPanelProps {
  email: string;
  onEmailChange: (e: ChangeEvent<HTMLInputElement>) => void;
  status: LookupStatus;
  lookupResult: LookupResult | null;
  onLookup: (e?: FormEvent) => void;
  teamIdInput: string;
  onTeamIdChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isUnlocked: boolean;
  statusMessage: string;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  name: string;
  onNameChange: (name: string) => void;
}

export default function CertificatesPanel({
  email,
  onEmailChange,
  status,
  lookupResult,
  onLookup,
  teamIdInput,
  onTeamIdChange,
  isUnlocked,
  statusMessage,
  projectName,
  onProjectNameChange,
  name,
  onNameChange,
}: CertificatesPanelProps) {
  // Placement overlay toggle (development only)
  const [showDevOverlay, setShowDevOverlay] = useState(false);

  // Active action notice
  const [actionNotice, setActionNotice] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);

  // Active exporting state
  const [exportingType, setExportingType] = useState<string | null>(null);

  // Canvas references for live previews
  const canvasPartRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCompRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-dismiss notices after 4 seconds
  useEffect(() => {
    if (actionNotice && actionNotice.type === "success") {
      const timer = setTimeout(() => setActionNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionNotice]);

  // Build certificate data from lookup result
  const getCertData = useCallback(
    (type: CertificateType): ParticipantCertificateData => {
      const certInfo = lookupResult?.certificates?.[type];
      return {
        name: name !== undefined && name !== "" ? name : (lookupResult?.name || ""),
        team: lookupResult?.team || "",
        teamId: lookupResult?.teamId || "",
        track: lookupResult?.track ?? 0,
        role: lookupResult?.role || "Team Leader",
        certificateId: certInfo?.id || "",
        projectName: projectName !== undefined ? projectName : (lookupResult?.idea || ""),
      };
    },
    [lookupResult, projectName, name]
  );

  // Eligibility flags (decided strictly by server)
  const isPartEligible =
    isUnlocked &&
    Boolean(lookupResult?.certificates?.participation?.eligible) &&
    Boolean(lookupResult?.certificates?.participation?.id);

  const isCompEligible =
    isUnlocked &&
    Boolean(lookupResult?.certificates?.completion?.eligible) &&
    Boolean(lookupResult?.certificates?.completion?.id);

  // Draw certificate previews
  useEffect(() => {
    if (!isUnlocked) return;

    const fontsReady =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready
        : Promise.resolve();

    // 1. Draw Participation preview if eligible
    if (isPartEligible && canvasPartRef.current) {
      const canvas = canvasPartRef.current;
      const tpl = CERTIFICATE_TEMPLATES.participation;
      if (canvas.width !== tpl.width || canvas.height !== tpl.height) {
        canvas.width = tpl.width;
        canvas.height = tpl.height;
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        Promise.all([preloadTemplateImage(tpl.backgroundPath), fontsReady]).then(
          ([bg]) => {
            renderCertificate(ctx, tpl, getCertData("participation"), {
              showPlacementOverlay: showDevOverlay,
              bgImage: bg,
            });
          }
        );
      }
    }

    // 2. Draw Completion preview if eligible
    if (isCompEligible && canvasCompRef.current) {
      const canvas = canvasCompRef.current;
      const tpl = CERTIFICATE_TEMPLATES.completion;
      if (canvas.width !== tpl.width || canvas.height !== tpl.height) {
        canvas.width = tpl.width;
        canvas.height = tpl.height;
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        Promise.all([preloadTemplateImage(tpl.backgroundPath), fontsReady]).then(
          ([bg]) => {
            renderCertificate(ctx, tpl, getCertData("completion"), {
              showPlacementOverlay: showDevOverlay,
              bgImage: bg,
            });
          }
        );
      }
    }
  }, [isUnlocked, isPartEligible, isCompEligible, showDevOverlay, getCertData]);

  // Action: Download PNG
  const handleDownload = async (type: CertificateType) => {
    if (exportingType) return;
    const tpl = CERTIFICATE_TEMPLATES[type];
    const data = getCertData(type);

    if (!data.certificateId) {
      setActionNotice({
        type: "error",
        message: "Cannot download certificate: valid verification code missing.",
      });
      return;
    }

    setExportingType(`${type}-download`);
    setActionNotice({
      type: "info",
      message: `Generating high-resolution ${tpl.title}…`,
    });

    try {
      const blob = await exportCertificateToBlob(tpl, data);
      downloadCertificateBlob(blob, type, data.name);
      setActionNotice({
        type: "success",
        message: `✓ Downloaded ${tpl.title} (PNG)`,
      });
    } catch (err: unknown) {
      console.error("Certificate download error:", err);
      setActionNotice({
        type: "error",
        message: "Failed to export certificate. Please try again.",
      });
    } finally {
      setExportingType(null);
    }
  };

  // Action: Copy caption
  const handleCopyCaption = async (type: CertificateType) => {
    if (exportingType) return;
    const data = getCertData(type);
    const caption = generateCertificateCaption(type, data);

    setExportingType(`${type}-copy`);
    try {
      const res = await copyTextToClipboard(caption);
      if (res.success) {
        setActionNotice({
          type: "success",
          message: "✓ Ready-to-post certificate caption copied to clipboard!",
        });
      } else {
        setActionNotice({
          type: "error",
          message: res.message || "Failed to copy caption.",
        });
      }
    } catch {
      setActionNotice({
        type: "error",
        message: "Could not copy caption to clipboard.",
      });
    } finally {
      setExportingType(null);
    }
  };

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <section className="certificates-panel" aria-label="Certificates studio">
      {/* Hero title */}
      <div className="studio-hero">
        <h1 className="studio-hero__title">
          Your NEXWIN
          <br />
          <span className="studio-hero__highlight">certificates.</span>
        </h1>
        <p className="studio-hero__subtitle">
          Unlock, verify, and export your official digital certificates for{" "}
          {EVENT.name} {EVENT.year}.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="certificates-lookup-wrapper">
        <form onSubmit={onLookup} className="field-group certificates-lookup-card">
          <div className="field">
            <label htmlFor="cert-lookup-email" className="field__label">
              REGISTERED EMAIL
            </label>
            <div className="email-input-wrapper">
              <input
                id="cert-lookup-email"
                type="email"
                className="field__input email-input"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={onEmailChange}
                aria-describedby="cert-status-line"
              />
              <button
                type="submit"
                className="btn btn--lookup"
                disabled={status === "loading" || !email.trim()}
                aria-label="Find my certificates"
              >
                {status === "loading" ? (
                  <>
                    <span className="spinner spinner--sm" aria-hidden="true" />
                    <span>Checking…</span>
                  </>
                ) : (
                  "Find me"
                )}
              </button>
            </div>
          </div>

          {/* Optional second verification check: Team ID */}
          {IS_REQUIRE_TEAM_ID_ENABLED && (
            <div className="field">
              <label htmlFor="cert-lookup-teamid" className="field__label">
                TEAM ID (REQUIRED)
              </label>
              <input
                id="cert-lookup-teamid"
                type="text"
                className="field__input"
                placeholder="e.g. DC-001"
                value={teamIdInput}
                onChange={onTeamIdChange}
              />
            </div>
          )}

          {/* Status line */}
          <div
            id="cert-status-line"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`status-line status-line--${status}`}
          >
            {statusMessage}
          </div>

          {/* Editable Name Field (allows participants to fix their name on certificates) */}
          {isUnlocked && (
            <div className="field cert-name-field" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <div className="field__label-row">
                <label htmlFor="cert-name-input" className="field__label">
                  PARTICIPANT NAME (EDITABLE)
                </label>
                <span className="field__hint">
                  Edit if spelling needs correction on certificates
                </span>
              </div>
              <input
                id="cert-name-input"
                type="text"
                className="field__input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                maxLength={60}
              />
            </div>
          )}
        </form>
      </div>

      {/* Action notice banner */}
      {actionNotice && (
        <div
          role="status"
          aria-live="polite"
          className={`action-notice action-notice--${actionNotice.type} cert-global-notice`}
        >
          {actionNotice.message}
        </div>
      )}

      {/* Dev Placement Overlay Toggle (Strictly Dev Only) */}
      {isDev && isUnlocked && (
        <div className="cert-dev-bar">
          <span className="cert-dev-badge">DEV TOOL</span>
          <label className="cert-dev-toggle">
            <input
              type="checkbox"
              checked={showDevOverlay}
              onChange={(e) => setShowDevOverlay(e.target.checked)}
            />
            <span>Show field placement overlay (calibration guide)</span>
          </label>
        </div>
      )}

      {/* Two Certificate Cards Grid */}
      <div className="certificates-grid">
        {/* ─── Card 1: Participation Certificate ─── */}
        <article className="certificate-card" aria-label="Participation Certificate">
          <div className="certificate-card__header">
            <div className="certificate-card__tag-row">
              <span className="cert-badge cert-badge--participation">
                PARTICIPATION
              </span>
              {isPartEligible && lookupResult?.certificates?.participation?.id && (
                <span className="cert-id-tag">
                  {lookupResult.certificates.participation.id}
                </span>
              )}
            </div>
            <h2 className="certificate-card__title">Certificate of Participation</h2>
            <p className="certificate-card__desc">
              Awarded to registered builders who participated in NEXWIN 2026.
            </p>
          </div>

          <div className="certificate-card__body">
            {!isUnlocked ? (
              <div className="certificate-state-card certificate-state-card--locked">
                <span className="cert-state-icon" aria-hidden="true">
                  🔒
                </span>
                <p className="cert-state-title">Verification Required</p>
                <p className="cert-state-desc">
                  Enter your registered email above to unlock and preview your
                  participation certificate.
                </p>
              </div>
            ) : isPartEligible ? (
              <div className="certificate-preview-stage">
                <canvas
                  ref={canvasPartRef}
                  className="certificate-canvas"
                  aria-label={`Preview of NEXWIN Certificate of Participation for ${lookupResult?.name || "Participant"}, ${lookupResult?.team || "Team"}`}
                />
              </div>
            ) : (
              <div className="certificate-state-card certificate-state-card--ineligible">
                <span className="cert-state-icon" aria-hidden="true">
                  ℹ️
                </span>
                <p className="cert-state-title">Not Available</p>
                <p className="cert-state-desc">
                  {CERTIFICATE_TEMPLATES.participation.ineligibleReason}
                </p>
                <div className="cert-state-help">
                  <p>{CERTIFICATE_SUPPORT.helpPrompt}</p>
                  <a
                    href={CERTIFICATE_SUPPORT.contactUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="cert-support-link"
                  >
                    Contact on {CERTIFICATE_SUPPORT.channelName} →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (only when eligible and unlocked) */}
          {isPartEligible && (
            <div className="certificate-card__actions">
              <button
                type="button"
                className="btn btn--export-primary"
                onClick={() => handleDownload("participation")}
                disabled={Boolean(exportingType)}
                aria-label="Download Certificate of Participation as PNG"
              >
                {exportingType === "participation-download" ? (
                  <>
                    <span className="spinner spinner--sm" aria-hidden="true" />
                    <span>Exporting…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
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

              <button
                type="button"
                className="btn btn--dark-pill"
                onClick={() => handleCopyCaption("participation")}
                disabled={Boolean(exportingType)}
                aria-label="Copy participation social post caption"
              >
                {exportingType === "participation-copy" ? (
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
            </div>
          )}
        </article>

        {/* ─── Card 2: Completion Certificate ─── */}
        <article className="certificate-card" aria-label="Completion Certificate">
          <div className="certificate-card__header">
            <div className="certificate-card__tag-row">
              <span className="cert-badge cert-badge--completion">
                COMPLETION
              </span>
              {isCompEligible && lookupResult?.certificates?.completion?.id && (
                <span className="cert-id-tag cert-id-tag--completion">
                  {lookupResult.certificates.completion.id}
                </span>
              )}
            </div>
            <h2 className="certificate-card__title">Certificate of Completion</h2>
            <p className="certificate-card__desc">
              Awarded to teams that successfully submitted their project and presented at NEXWIN Finals.
            </p>
          </div>

          <div className="certificate-card__body">
            {!isUnlocked ? (
              <div className="certificate-state-card certificate-state-card--locked">
                <span className="cert-state-icon" aria-hidden="true">
                  🔒
                </span>
                <p className="cert-state-title">Verification Required</p>
                <p className="cert-state-desc">
                  Enter your registered email above to unlock and preview your
                  completion certificate.
                </p>
              </div>
            ) : isCompEligible ? (
              <>
                {onProjectNameChange && (
                  <div className="field cert-project-field" style={{ marginBottom: "1rem" }}>
                    <label htmlFor="cert-project-input" className="field__label">
                      PROJECT NAME
                    </label>
                    <input
                      id="cert-project-input"
                      type="text"
                      className="field__input"
                      placeholder="e.g. Builder Pass Studio"
                      value={projectName ?? ""}
                      onChange={(e) => onProjectNameChange(e.target.value)}
                      maxLength={60}
                    />
                  </div>
                )}
                <div className="certificate-preview-stage">
                  <canvas
                    ref={canvasCompRef}
                    className="certificate-canvas"
                    aria-label={`Preview of NEXWIN Certificate of Completion for ${lookupResult?.name || "Participant"}, ${lookupResult?.team || "Team"}`}
                  />
                </div>
              </>
            ) : (
              <div className="certificate-state-card certificate-state-card--ineligible">
                <span className="cert-state-icon" aria-hidden="true">
                  ℹ️
                </span>
                <p className="cert-state-title">Completion Certificate Unavailable</p>
                <p className="cert-state-desc">
                  {CERTIFICATE_TEMPLATES.completion.ineligibleReason}
                </p>
                <div className="cert-state-help">
                  <p>{CERTIFICATE_SUPPORT.helpPrompt}</p>
                  <a
                    href={CERTIFICATE_SUPPORT.contactUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="cert-support-link"
                  >
                    Contact on {CERTIFICATE_SUPPORT.channelName} →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (only when eligible and unlocked) */}
          {isCompEligible && (
            <div className="certificate-card__actions">
              <button
                type="button"
                className="btn btn--export-primary"
                onClick={() => handleDownload("completion")}
                disabled={Boolean(exportingType)}
                aria-label="Download Certificate of Completion as PNG"
              >
                {exportingType === "completion-download" ? (
                  <>
                    <span className="spinner spinner--sm" aria-hidden="true" />
                    <span>Exporting…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
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

              <button
                type="button"
                className="btn btn--dark-pill"
                onClick={() => handleCopyCaption("completion")}
                disabled={Boolean(exportingType)}
                aria-label="Copy completion social post caption"
              >
                {exportingType === "completion-copy" ? (
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
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
