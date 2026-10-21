import type { TrackMarkShape } from "@/lib/config";

/**
 * Draws a geometric track mark directly onto canvas context inside the given bounding box.
 * Fully vector-based, crisp at any scale.
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
    case "neural_node": {
      // Spark/diamond lattice with 4 satellite nodes
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.stroke();

      // Satellite dots
      const dotR = Math.max(2, size * 0.09);
      const points = [
        [0, -r],
        [r, 0],
        [0, r],
        [-r, 0],
        [0, 0],
      ];
      for (const [px, py] of points) {
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "blockchain_cube": {
      // Isometric 3D Hexagon/Cube
      const h = r;
      const w = r * 0.866;
      ctx.beginPath();
      // Outer hexagon
      ctx.moveTo(0, -h);
      ctx.lineTo(w, -h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(0, h);
      ctx.lineTo(-w, h * 0.5);
      ctx.lineTo(-w, -h * 0.5);
      ctx.closePath();
      ctx.stroke();

      // Inner Y edges
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, h);
      ctx.moveTo(0, 0);
      ctx.lineTo(w, -h * 0.5);
      ctx.moveTo(0, 0);
      ctx.lineTo(-w, -h * 0.5);
      ctx.stroke();
      break;
    }

    case "double_helix": {
      // Intertwined helix wave with 3 crossbars
      const w = r * 0.75;
      ctx.beginPath();
      // Strand 1
      ctx.moveTo(-w, -r);
      ctx.bezierCurveTo(w, -r * 0.33, -w, r * 0.33, w, r);
      ctx.stroke();

      // Strand 2
      ctx.beginPath();
      ctx.moveTo(w, -r);
      ctx.bezierCurveTo(-w, -r * 0.33, w, r * 0.33, -w, r);
      ctx.stroke();

      // Crossbars
      ctx.beginPath();
      ctx.moveTo(-w * 0.5, -r * 0.65);
      ctx.lineTo(w * 0.5, -r * 0.65);
      ctx.moveTo(-w * 0.3, 0);
      ctx.lineTo(w * 0.3, 0);
      ctx.moveTo(-w * 0.5, r * 0.65);
      ctx.lineTo(w * 0.5, r * 0.65);
      ctx.stroke();
      break;
    }

    case "leaf_rings": {
      // Botanical leaf profile with concentric arc
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.9, -r * 0.2, 0, r);
      ctx.quadraticCurveTo(-r * 0.9, -r * 0.2, 0, -r);
      ctx.stroke();

      // Center vein
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8);
      ctx.lineTo(0, r * 0.8);
      ctx.stroke();

      // Side ring arc
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.stroke();
      break;
    }

    case "open_book": {
      // Modern stylized chevron book with beacon
      ctx.beginPath();
      // Left page
      ctx.moveTo(-r * 0.85, -r * 0.4);
      ctx.quadraticCurveTo(-r * 0.4, -r * 0.6, 0, -r * 0.2);
      ctx.lineTo(0, r * 0.6);
      ctx.quadraticCurveTo(-r * 0.4, r * 0.2, -r * 0.85, r * 0.4);
      ctx.closePath();
      ctx.stroke();

      // Right page
      ctx.beginPath();
      ctx.moveTo(r * 0.85, -r * 0.4);
      ctx.quadraticCurveTo(r * 0.4, -r * 0.6, 0, -r * 0.2);
      ctx.lineTo(0, r * 0.6);
      ctx.quadraticCurveTo(r * 0.4, r * 0.2, r * 0.85, r * 0.4);
      ctx.closePath();
      ctx.stroke();

      // Beacon dot
      ctx.beginPath();
      ctx.arc(0, -r * 0.6, Math.max(2, size * 0.08), 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "compass_star": {
      // 8-point innovation spark
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const rad = i % 2 === 0 ? r : r * 0.42;
        const px = Math.cos(angle) * rad;
        const py = Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, Math.max(2, size * 0.08), 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}
