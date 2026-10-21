import type { TrackMarkShape } from "@/lib/config";

export {
  drawNexWinLogo,
  drawNexWinLockup,
} from "./logo";

/**
 * Draws a geometric track mark directly onto canvas context inside the given bounding box.
 * Sourced for NEXWIN 5 tracks:
 * - Track 01: event_calendar (Event & Workshop Management)
 * - Track 02: open_book (Learning, Resources & Skill Development)
 * - Track 03: governance_shield (Club Governance & Operations)
 * - Track 04: community_nodes (Member Experience & Community)
 * - Track 05: digital_broadcast (Public Relations & Digital Presence)
 */
export function drawTrackMark(
  ctx: CanvasRenderingContext2D,
  mark: TrackMarkShape,
  x: number,
  y: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const r = size * 0.42;

  switch (mark) {
    case "event_calendar": {
      // Modern calendar card with hanging loops and day star
      const bw = r * 0.85;
      const bh = r * 0.8;
      const topY = -r * 0.65;

      // Calendar body
      ctx.beginPath();
      ctx.strokeRect(-bw, topY, bw * 2, bh * 1.6);

      // Header divider line
      ctx.beginPath();
      ctx.moveTo(-bw, topY + bh * 0.45);
      ctx.lineTo(bw, topY + bh * 0.45);
      ctx.stroke();

      // Top binder rings
      const ringOffset = bw * 0.5;
      const ringH = r * 0.25;
      ctx.beginPath();
      ctx.moveTo(-ringOffset, topY - ringH);
      ctx.lineTo(-ringOffset, topY);
      ctx.moveTo(ringOffset, topY - ringH);
      ctx.lineTo(ringOffset, topY);
      ctx.stroke();

      // Center spark node representing an event day
      ctx.beginPath();
      ctx.arc(0, topY + bh * 1.05, Math.max(2.5, size * 0.09), 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "open_book": {
      // Modern stylized chevron book with learning beacon
      const bw = r * 0.85;
      ctx.beginPath();
      // Left page
      ctx.moveTo(-bw, -r * 0.4);
      ctx.quadraticCurveTo(-bw * 0.5, -r * 0.6, 0, -r * 0.2);
      ctx.lineTo(0, r * 0.6);
      ctx.quadraticCurveTo(-bw * 0.5, r * 0.2, -bw, r * 0.4);
      ctx.closePath();
      ctx.stroke();

      // Right page
      ctx.beginPath();
      ctx.moveTo(bw, -r * 0.4);
      ctx.quadraticCurveTo(bw * 0.5, -r * 0.6, 0, -r * 0.2);
      ctx.lineTo(0, r * 0.6);
      ctx.quadraticCurveTo(bw * 0.5, r * 0.2, bw, r * 0.4);
      ctx.closePath();
      ctx.stroke();

      // Beacon dot
      ctx.beginPath();
      ctx.arc(0, -r * 0.6, Math.max(2, size * 0.08), 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "governance_shield": {
      // Clean angular cyber-shield with internal governance balance pillar
      const sw = r * 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(sw, -r * 0.6);
      ctx.lineTo(sw, r * 0.2);
      ctx.quadraticCurveTo(sw * 0.5, r * 0.8, 0, r);
      ctx.quadraticCurveTo(-sw * 0.5, r * 0.8, -sw, r * 0.2);
      ctx.lineTo(-sw, -r * 0.6);
      ctx.closePath();
      ctx.stroke();

      // Central pillar of governance
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.5);
      ctx.lineTo(0, r * 0.55);
      ctx.moveTo(-sw * 0.4, -r * 0.1);
      ctx.lineTo(sw * 0.4, -r * 0.1);
      ctx.stroke();
      break;
    }

    case "community_nodes": {
      // Network of 3 connected community members
      const nr = Math.max(2.5, size * 0.09);
      const topY = -r * 0.7;
      const bY = r * 0.55;
      const bX = r * 0.75;

      // Connecting bridge lines
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(-bX, bY);
      ctx.lineTo(bX, bY);
      ctx.closePath();
      ctx.stroke();

      // 3 Community Member Nodes
      const nodes = [
        [0, topY],
        [-bX, bY],
        [bX, bY],
      ];
      for (const [nx, ny] of nodes) {
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center synergy spark
      ctx.beginPath();
      ctx.arc(0, r * 0.1, Math.max(1.8, size * 0.05), 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "digital_broadcast": {
      // Concentric signal waves and central transmitter tower
      ctx.beginPath();
      // Outer waves
      ctx.arc(0, 0, r * 0.85, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, Math.PI * 0.65, Math.PI * 1.35);
      ctx.stroke();

      // Inner waves
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, Math.PI * 0.65, Math.PI * 1.35);
      ctx.stroke();

      // Transmitter beacon
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(2.5, size * 0.09), 0, Math.PI * 2);
      ctx.fill();

      // Base mast
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 0.9);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
