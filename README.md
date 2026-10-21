# Builder Pass Studio

A fast, mobile-friendly Next.js web application where registered hackathon participants unlock, customize, preview, and export a personalized digital builder pass and ready-to-post social caption.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (http://localhost:3000)
npm run dev

# 3. Build for production
npm run build

# 4. Run linter
npm run lint
```

## Changing the Event Configuration

All event-specific text, URLs, dates, tracks, mascots, and pass sizes are centralized in a single source of truth:

👉 **[`lib/config.ts`](lib/config.ts)**

To rebrand or configure the studio for your hackathon:
1. Open `lib/config.ts`.
2. Update the `EVENT` object:
   - `name`: Full event title (e.g., `"NexWin Hackathon 2026"`)
   - `badgeText`: Short pill badge text (e.g., `"NEXWIN/HACK 26"`)
   - `siteUrl`: Official hackathon website URL
   - `dates`: Event timeline & format (e.g., `"1–7 Nov 2026 · Online"`)
   - `hashtags`: List of hashtags for social sharing
   - `organiser`: Organization hosting the event
3. Update `TRACKS` array with your 6 competition tracks.
4. (Optional) Customize mascots or sizes in the same file.

No code changes outside `lib/config.ts` are required to rebrand the event.

## Replacing Sample Registrations with Real Data

The participant lookup reads from:

👉 **[`data/registrations.json`](data/registrations.json)**

### Format

Each record must conform to the following schema:

```json
[
  {
    "email": "participant@example.com",
    "name": "Alex Morgan",
    "team": "CyberCraft",
    "teamId": "CC-042",
    "track": 0,
    "role": "Team Leader",
    "members": 2,
    "idea": "Autonomous drone coordination protocol"
  }
]
```

- `email`: Lookup key (matched case-insensitively, trimmed).
- `name`: Participant's full name.
- `team`: Team name.
- `teamId`: Short alphanumeric team identifier.
- `track`: Zero-based index into `TRACKS` from `lib/config.ts` (0 to 5).
- `role`: Role title (e.g., `"Team Leader"` or `"Member"`).
- `members`: Total team member count.
- `idea`: (Optional) Initial project idea title.

### Privacy & Security Guidelines

- **Never commit real participant emails or personal data to version control.**
- Keep `data/registrations.json` populated only with sample/test data in Git repositories.
- In production deployments (e.g., Vercel, Docker, VPS), mount or supply the real registration file securely during deployment.
- The lookup endpoint (`/api/lookup`) enforces per-IP rate limiting (10 requests/minute) and returns identical timing and HTTP 200 status for misses so existence cannot be probed.
- Pass images are rendered entirely in the browser using HTML5 Canvas and Three.js — no participant passes or graphics are uploaded to any server.

## Features & Export Options

- **Email Unlock**: Instant lookup with autofilled read-only fields.
- **Live Canvas Preview**: Real-time rendering as the user edits idea title, GitHub handle, or track.
- **4 Design Styles**: Editorial, Night, Pop, and Collector.
- **8 Character Cast**: High-resolution pre-rendered studio characters with normalized head sizes and baselines, transparent background cutouts, zero grey fringe, and async decoding. Asset budgets strictly maintained:
  - Full body large (1024×1024): < 250 KB
  - Full body small (256×256): < 45 KB
  - Bust crop large (512×512): < 120 KB
  - Bust crop small (128×128): < 20 KB
- **5 Export Sizes**:
  - The pass (1080×1350) — Main portrait download
  - Square (1080×1080) — Instagram/LinkedIn feed post
  - Link (1200×630) — Landscape link preview card
  - Story (1080×1920) — Vertical 9:16 story/reels
  - Avatar (400×400) — Circular profile avatar
- **Export Actions**:
  - **Download PNG**: Direct single-size export.
  - **All sizes (4)**: Sequential batch download with throttling protection.
  - **Copy image**: Clipboard PNG for instant pasting.
  - **Copy caption**: Complete, clean post caption with links and hashtags.
  - **Share**: Native device share sheet on supported mobile platforms.
