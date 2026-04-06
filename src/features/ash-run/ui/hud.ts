import {
  UNSTABLE_MOTION_VX_MIN,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "../core/constants";
import type { GameState } from "../core/types";

function unstableCanFire(ash: GameState["ash"]): boolean {
  return (
    !ash.grounded ||
    Math.abs(ash.vx) >= UNSTABLE_MOTION_VX_MIN ||
    ash.dashRemainingMs > 0
  );
}

function channelLabel(ch: 0 | 1 | 2): string {
  return ch === 0 ? "BIO" : ch === 1 ? "MECHA" : "PURE";
}

export function drawHud(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { ash, beat, phase } = state;

  ctx.fillStyle = "#e8e8ec";
  ctx.font = "14px system-ui, sans-serif";
  ctx.textAlign = "left";
  let hx = 16;
  const hy = 28;
  for (let i = 0; i < ash.maxHp; i++) {
    ctx.fillStyle = i < Math.ceil(ash.hp) ? "#ff6b6b" : "#333";
    ctx.fillText("♥", hx, hy);
    hx += 22;
  }

  ctx.fillStyle = "#889";
  ctx.font = "12px system-ui";
  const unstableHud =
    ash.unstableCooldownMs > 0
      ? `${(ash.unstableCooldownMs / 1000).toFixed(1)}s`
      : unstableCanFire(ash)
        ? "READY"
        : "move";
  const nextCh = channelLabel(ash.unstableNextChannel);
  ctx.fillText(`Unstable [K]: ${unstableHud} · next ${nextCh}`, 16, 50);

  if (ash.perceptionRemainingMs > 0) {
    ctx.fillStyle = "#aee";
    ctx.font = "12px system-ui";
    ctx.fillText("PURE — route sense (slow)", 16, 66);
  }

  const ch =
    ash.unstableChannel === 0
      ? "BIO"
      : ash.unstableChannel === 1
        ? "MECHA"
        : ash.unstableChannel === 2
          ? "PURE"
          : "";
  if (ch && ash.unstableFlashMs > 0) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px system-ui";
    ctx.fillText(`Channel: ${ch}`, 16, 86);
  }

  if (beat) {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, VIEW_HEIGHT - 100, VIEW_WIDTH, 100);
    ctx.fillStyle = "#eee";
    ctx.font = "14px system-ui";
    const words = beat.text;
    const maxW = VIEW_WIDTH - 48;
    let line = "";
    let y = VIEW_HEIGHT - 82;
    for (const w of words.split(" ")) {
      const test = line + (line ? " " : "") + w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, 24, y);
        y += 20;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 24, y);
  }

  if (phase === "won") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Slice clear — lab hatch", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 12);
    ctx.font = "14px system-ui";
    ctx.fillText("Reload page to replay", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 20);
    ctx.textAlign = "left";
  }
}
