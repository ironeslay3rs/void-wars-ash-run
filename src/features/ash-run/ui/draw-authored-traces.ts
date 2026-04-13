/**
 * Authored resonance traces — render layer for Pure Resonance Sight.
 * Canon: lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md
 *
 * Three kinds, each a distinct visual stratum (information, not UI):
 *  - safe_route   : pale-ivory survivor spine ("someone made it through here").
 *  - victim_path  : rose-amber frayed line, breaks near the end ("someone did not").
 *  - patrol_echo  : cool teal whisper, synced with the enemy-ghost palette.
 *
 * Caller (drawTimeShadowOverlays) has already translated by -cameraX and gated
 * by perception being active; we only modulate by `edgeFade` and `flick`.
 */

import type { VisibleTimeShadows } from "../perception/timeShadowSystem";

type AuthoredTrace = VisibleTimeShadows["authoredTraces"][number];

const KIND_STYLE: Record<
  AuthoredTrace["kind"],
  {
    stroke: string;
    markerFill: string;
    baseAlpha: number;
    markerAlpha: number;
    dash: number[];
    lineWidth: number;
  }
> = {
  safe_route: {
    stroke: "rgba(225, 235, 210, 0.55)",
    markerFill: "rgba(235, 245, 215, 0.7)",
    baseAlpha: 0.085,
    markerAlpha: 0.11,
    dash: [4, 6],
    lineWidth: 0.9,
  },
  victim_path: {
    stroke: "rgba(225, 145, 130, 0.55)",
    markerFill: "rgba(240, 170, 150, 0.6)",
    baseAlpha: 0.08,
    markerAlpha: 0.1,
    dash: [3, 4, 2, 8],
    lineWidth: 0.85,
  },
  patrol_echo: {
    stroke: "rgba(115, 220, 200, 0.5)",
    markerFill: "rgba(140, 230, 210, 0.55)",
    baseAlpha: 0.06,
    markerAlpha: 0.08,
    dash: [2, 7],
    lineWidth: 0.75,
  },
};

/**
 * Render authored traces for one perception-active frame. Stays subtle —
 * Resonance Sight is information, not UI chrome.
 */
export function drawAuthoredTraces(
  ctx: CanvasRenderingContext2D,
  traces: VisibleTimeShadows["authoredTraces"],
  nowMs: number,
  edgeFade: number,
  flick: number,
): void {
  if (traces.length === 0 || edgeFade < 0.04) return;

  for (const tr of traces) {
    if (tr.points.length < 2) continue;
    const style = KIND_STYLE[tr.kind];
    const fade = edgeFade * tr.intensity;

    ctx.globalAlpha = style.baseAlpha * fade * flick;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth;
    ctx.lineCap = "round";
    ctx.setLineDash(style.dash);
    ctx.lineDashOffset = (nowMs * 0.014) % 40;

    ctx.beginPath();
    ctx.moveTo(tr.points[0]!.x, tr.points[0]!.y);
    for (let i = 1; i < tr.points.length; i++) {
      const p = tr.points[i]!;
      /* victim_path frays toward its end — sever the final segment with a
         visible gap so the ghost "stops" before arriving. */
      if (tr.kind === "victim_path" && i === tr.points.length - 1) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        continue;
      }
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    const step = Math.max(1, Math.floor(tr.points.length / 6));
    ctx.fillStyle = style.markerFill;
    for (let i = 0; i < tr.points.length; i += step) {
      const p = tr.points[i]!;
      ctx.globalAlpha = style.markerAlpha * fade;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}
