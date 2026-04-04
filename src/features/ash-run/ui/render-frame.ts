import { VIEW_HEIGHT, VIEW_WIDTH } from "../core/constants";
import type { GameState } from "../core/types";
import { drawHud } from "./hud";

/** World + entities (camera-space). */
export function drawWorld(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { level, ash, enemies, cameraX, phase } = state;

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  for (const e of level.entities) {
    if (e.kind !== "solid") continue;
    ctx.fillStyle = "#2a3344";
    ctx.strokeStyle = "#4a5a70";
    ctx.lineWidth = 2;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeRect(e.x, e.y, e.w, e.h);
  }

  for (const e of level.entities) {
    if (e.kind !== "hazard") continue;
    ctx.fillStyle = "rgba(40, 220, 120, 0.35)";
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = "#2cf088";
    ctx.strokeRect(e.x, e.y, e.w, e.h);
  }

  for (const e of level.entities) {
    if (e.kind !== "checkpoint") continue;
    ctx.fillStyle = "rgba(120, 200, 255, 0.25)";
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = "#9dd4ff";
    ctx.font = "12px system-ui";
    ctx.fillText("SAVE", e.x + 4, e.y + 24);
  }

  for (const e of level.entities) {
    if (e.kind !== "boss_gate") continue;
    ctx.fillStyle = "#1a1528";
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = "#6b4fff";
    ctx.strokeRect(e.x, e.y, e.w, e.h);
  }

  for (const e of level.entities) {
    if (e.kind !== "exit") continue;
    ctx.fillStyle = "rgba(255, 220, 120, 0.3)";
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = "#ffd060";
    ctx.strokeRect(e.x, e.y, e.w, e.h);
  }

  for (const en of enemies) {
    ctx.fillStyle = en.isMiniboss ? "#8b5cf6" : "#e85555";
    ctx.fillRect(en.x, en.y, en.w, en.h);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(en.x, en.y, en.w, en.h);
  }

  if (phase === "playing" || phase === "won") {
    ctx.fillStyle =
      ash.invulnMs > 0 && Math.floor(ash.invulnMs / 80) % 2 ? "#888" : "#d4a88c";
    ctx.fillRect(ash.x, ash.y, ash.width, ash.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.strokeRect(ash.x, ash.y, ash.width, ash.height);
    if (ash.unstableFlashMs > 0) {
      ctx.strokeStyle =
        ash.unstableChannel === 0
          ? "#ff4466"
          : ash.unstableChannel === 1
            ? "#44aaff"
            : "#aaffee";
      ctx.lineWidth = 3;
      ctx.strokeRect(ash.x - 2, ash.y - 2, ash.width + 4, ash.height + 4);
    }
  }

  if (ash.hitbox.active) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fillRect(ash.hitbox.x, ash.hitbox.y, ash.hitbox.w, ash.hitbox.h);
  }

  ctx.restore();
}

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
): void {
  ctx.fillStyle = "#07080d";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawWorld(ctx, state);
  drawHud(ctx, state);
}
