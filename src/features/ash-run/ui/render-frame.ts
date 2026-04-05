import {
  ATTACK_ACTIVE_MS,
  HIT_STOP_MS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "../core/constants";
import type { GameState } from "../core/types";
import type { Ash, PatrolEnemy } from "../entities/types";
import { drawHud } from "./hud";

/** Mutable render-only state: edge detection, particles, trails. */
export type RenderScratch = {
  prevAsh: {
    grounded: boolean;
    vy: number;
    hp: number;
    invulnMs: number;
  };
  prevEnemies: Map<
    string,
    {
      hp: number;
      x: number;
      y: number;
      w: number;
      h: number;
      isMiniboss: boolean;
    }
  >;
  landingBurstMs: number;
  playerHitFlashMs: number;
  deathBursts: Array<{
    x: number;
    y: number;
    life: number;
    isMiniboss: boolean;
  }>;
  dashTrails: Array<{ x: number; y: number; life: number }>;
  initialized: boolean;
};

export function createRenderScratch(): RenderScratch {
  return {
    prevAsh: { grounded: true, vy: 0, hp: 0, invulnMs: 0 },
    prevEnemies: new Map(),
    landingBurstMs: 0,
    playerHitFlashMs: 0,
    deathBursts: [],
    dashTrails: [],
    initialized: false,
  };
}

const LAND_VY_THRESHOLD = 260;
const LAND_BURST_DURATION_MS = 240;
const PLAYER_HIT_FLASH_MS = 320;
const DEATH_BURST_DRONE_MS = 380;
const DEATH_BURST_BOSS_MS = 520;
const DASH_TRAIL_MAX = 7;
const DASH_TRAIL_DECAY_PER_MS = 0.0045;

function advanceScratch(
  scratch: RenderScratch,
  state: GameState,
  frameDtMs: number,
): void {
  const dt = Math.min(frameDtMs, 48);
  scratch.landingBurstMs = Math.max(0, scratch.landingBurstMs - dt);
  scratch.playerHitFlashMs = Math.max(0, scratch.playerHitFlashMs - dt);

  for (const b of scratch.deathBursts) {
    const maxL = b.isMiniboss ? DEATH_BURST_BOSS_MS : DEATH_BURST_DRONE_MS;
    b.life -= dt / maxL;
  }
  scratch.deathBursts = scratch.deathBursts.filter((b) => b.life > 0);

  for (const t of scratch.dashTrails) {
    t.life -= dt * DASH_TRAIL_DECAY_PER_MS;
  }
  scratch.dashTrails = scratch.dashTrails.filter((t) => t.life > 0);

  const { ash } = state;

  if (scratch.initialized) {
    const landed =
      !scratch.prevAsh.grounded &&
      ash.grounded &&
      scratch.prevAsh.vy > LAND_VY_THRESHOLD;
    if (landed) scratch.landingBurstMs = LAND_BURST_DURATION_MS;

    const hpDrop = ash.hp < scratch.prevAsh.hp - 0.001;
    const invulnSpike = ash.invulnMs - scratch.prevAsh.invulnMs > 350;
    if (hpDrop || invulnSpike) scratch.playerHitFlashMs = PLAYER_HIT_FLASH_MS;

    const curIds = new Set(state.enemies.map((e) => e.id));
    for (const [id, snap] of scratch.prevEnemies) {
      if (!curIds.has(id) && snap.hp > 0) {
        scratch.deathBursts.push({
          x: snap.x + snap.w / 2,
          y: snap.y + snap.h / 2,
          life: 1,
          isMiniboss: snap.isMiniboss,
        });
      }
    }
  }

  if (ash.dashRemainingMs > 0) {
    scratch.dashTrails.unshift({
      x: ash.x + ash.width / 2,
      y: ash.y + ash.height / 2,
      life: 1,
    });
    if (scratch.dashTrails.length > DASH_TRAIL_MAX) {
      scratch.dashTrails.length = DASH_TRAIL_MAX;
    }
  }

  scratch.prevAsh = {
    grounded: ash.grounded,
    vy: ash.vy,
    hp: ash.hp,
    invulnMs: ash.invulnMs,
  };

  scratch.prevEnemies.clear();
  for (const en of state.enemies) {
    scratch.prevEnemies.set(en.id, {
      hp: en.hp,
      x: en.x,
      y: en.y,
      w: en.w,
      h: en.h,
      isMiniboss: en.isMiniboss,
    });
  }
  scratch.initialized = true;
}

function drawDeathBursts(
  ctx: CanvasRenderingContext2D,
  scratch: RenderScratch,
  cameraX: number,
): void {
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  for (const b of scratch.deathBursts) {
    const n = b.isMiniboss ? 14 : 8;
    const spread = b.isMiniboss ? 52 : 28;
    const alpha = Math.max(0, b.life);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + (1 - b.life) * 2.2;
      const dist = spread * (1 - b.life) * (0.6 + (i % 3) * 0.15);
      const px = b.x + Math.cos(ang) * dist;
      const py = b.y + Math.sin(ang) * dist * 0.65;
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = b.isMiniboss ? "#c4a8ff" : "#ff8866";
      ctx.beginPath();
      ctx.arc(px, py, b.isMiniboss ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = b.isMiniboss ? "#6b4fff" : "#ff4422";
    ctx.beginPath();
    ctx.arc(b.x, b.y, (1 - b.life) * (b.isMiniboss ? 56 : 22), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLandingBurst(
  ctx: CanvasRenderingContext2D,
  ash: GameState["ash"],
  cameraX: number,
  scratch: RenderScratch,
): void {
  if (scratch.landingBurstMs <= 0) return;
  const t = scratch.landingBurstMs / LAND_BURST_DURATION_MS;
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  const cx = ash.x + ash.width / 2;
  const cy = ash.y + ash.height;
  const w = 26 + (1 - t) * 38;
  ctx.globalAlpha = t * 0.55;
  ctx.fillStyle = "#dde4f0";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, w, 8 * t, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = t * 0.4;
  for (let i = 0; i < 5; i++) {
    const off = (i - 2) * 7 * (1 - t);
    ctx.fillRect(cx + off - 2, cy - 4 - (1 - t) * 12, 4, 3 + (1 - t) * 8);
  }
  ctx.restore();
}

function drawDashTrails(
  ctx: CanvasRenderingContext2D,
  scratch: RenderScratch,
  cameraX: number,
  facing: 1 | -1,
): void {
  if (scratch.dashTrails.length === 0) return;
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  for (let i = scratch.dashTrails.length - 1; i >= 0; i--) {
    const tr = scratch.dashTrails[i]!;
    const a = tr.life * 0.45;
    ctx.globalAlpha = a;
    ctx.fillStyle = "#a8d4ff";
    ctx.beginPath();
    ctx.ellipse(
      tr.x - facing * (1 - tr.life) * 10,
      tr.y,
      8 + tr.life * 6,
      14 * tr.life,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 240, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSlashArc(
  ctx: CanvasRenderingContext2D,
  ash: GameState["ash"],
  cameraX: number,
): void {
  if (!ash.hitbox.active || !ash.hitbox.hurtsEnemies) return;
  const maxTtl = ATTACK_ACTIVE_MS + 45;
  const p = 1 - ash.hitbox.ttl / maxTtl;
  if (p <= 0 || p > 1) return;
  const flash = Math.sin(p * Math.PI);
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  const hx = ash.hitbox.x + ash.hitbox.w / 2;
  const hy = ash.hitbox.y + ash.hitbox.h / 2;
  const r = 26 + flash * 8;
  const start = ash.facing === 1 ? -0.25 : Math.PI - 0.25;
  const sweep = ash.facing * 1.15;
  ctx.globalAlpha = flash * 0.95;
  ctx.strokeStyle = "#fff8e8";
  ctx.lineWidth = 3 + flash * 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(hx, hy, r, start, start + sweep, ash.facing !== 1);
  ctx.stroke();
  ctx.globalAlpha = flash * 0.35;
  ctx.strokeStyle = "#88ccff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(hx, hy, r + 3, start, start + sweep, ash.facing !== 1);
  ctx.stroke();
  ctx.restore();
}

function drawHazardsAnimated(
  ctx: CanvasRenderingContext2D,
  level: GameState["level"],
  cameraX: number,
  nowMs: number,
): void {
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  for (const e of level.entities) {
    if (e.kind !== "hazard") continue;
    const wave =
      0.5 +
      0.5 *
        Math.sin(nowMs * 0.005 + e.x * 0.012 + e.y * 0.009);
    const baseA = 0.28 + wave * 0.12;
    ctx.fillStyle = `rgba(60, 255, 130, ${baseA})`;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = `rgba(120, 255, 200, ${0.08 + wave * 0.06})`;
    ctx.fillRect(e.x + 2, e.y + 2, e.w - 4, Math.max(2, (e.h - 4) * 0.35));
    ctx.strokeStyle = `rgba(180, 255, 160, ${0.75 + wave * 0.2})`;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(e.x + 0.5, e.y + 0.5, e.w - 1, e.h - 1);
    ctx.strokeStyle = "rgba(255, 255, 220, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(e.x + 3, e.y + 3, e.w - 6, e.h - 6);
  }
  ctx.restore();
}

/**
 * Screen-space accent during sim hit-stop: communicates “freeze” without hiding UI.
 * Uses short remaining time so the pop fades as stop ends (synced to HIT_STOP_MS).
 */
function drawHitStopScreenAccent(
  ctx: CanvasRenderingContext2D,
  hitStopRemainingMs: number,
): void {
  if (hitStopRemainingMs <= 0) return;
  const u = Math.min(1, hitStopRemainingMs / HIT_STOP_MS);
  ctx.save();
  /* Slight brighten — reads as impact frame, stays under ~8% peak. */
  ctx.globalAlpha = 0.035 + u * 0.055;
  ctx.fillStyle = "#f4f6ff";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  /* Soft edge vignette: draws focus to center, sells “stutter”. */
  const g = ctx.createRadialGradient(
    VIEW_WIDTH / 2,
    VIEW_HEIGHT / 2,
    VIEW_HEIGHT * 0.22,
    VIEW_WIDTH / 2,
    VIEW_HEIGHT / 2,
    Math.max(VIEW_WIDTH, VIEW_HEIGHT) * 0.72,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(6,8,18,${0.12 + u * 0.1})`);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.restore();
}

/**
 * Checkpoint: beacon pulse + glow so SAVE reads at a glance from mid-camera.
 */
function drawCheckpointVisual(
  ctx: CanvasRenderingContext2D,
  e: { x: number; y: number; w: number; h: number },
  nowMs: number,
): void {
  const pulse = 0.5 + 0.5 * Math.sin(nowMs * 0.0035 + e.x * 0.015);
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const pad = 6 + pulse * 10;

  ctx.save();
  ctx.globalAlpha = 0.12 + pulse * 0.14;
  ctx.strokeStyle = "#7ecbff";
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x - pad, e.y - pad, e.w + pad * 2, e.h + pad * 2);
  ctx.globalAlpha = 0.06 + pulse * 0.08;
  ctx.strokeStyle = "#b8e8ff";
  ctx.lineWidth = 2;
  const pad2 = pad + 8;
  ctx.strokeRect(e.x - pad2, e.y - pad2, e.w + pad2 * 2, e.h + pad2 * 2);

  ctx.globalAlpha = 0.42 + pulse * 0.28;
  ctx.fillStyle = "rgba(100, 200, 255, 0.35)";
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.globalAlpha = 0.55 + pulse * 0.25;
  const rg = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(e.w, e.h) * 1.4);
  rg.addColorStop(0, "rgba(200, 240, 255, 0.5)");
  rg.addColorStop(1, "rgba(80, 160, 220, 0)");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(e.w, e.h) * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#e8f8ff";
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.strokeText("SAVE", cx, e.y + 26);
  ctx.fillText("SAVE", cx, e.y + 26);
  ctx.textAlign = "left";
  ctx.restore();
}

function minibossAlive(enemies: PatrolEnemy[]): boolean {
  return enemies.some((en) => en.isMiniboss && en.hp > 0);
}

/**
 * Exit hatch: open (clear path to win) vs locked (sentinel still up).
 * Same geometry; presentation only — win logic unchanged in core.
 */
function drawExitVisual(
  ctx: CanvasRenderingContext2D,
  e: { x: number; y: number; w: number; h: number },
  locked: boolean,
  nowMs: number,
): void {
  const cx = e.x + e.w / 2;
  ctx.save();
  if (locked) {
    ctx.fillStyle = "rgba(28, 24, 38, 0.92)";
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = "rgba(90, 40, 55, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(e.x + 1, e.y + 1, e.w - 2, e.h - 2);
    ctx.strokeStyle = "rgba(180, 60, 70, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.x + 4, e.y + 4);
    ctx.lineTo(e.x + e.w - 4, e.y + e.h - 4);
    ctx.moveTo(e.x + e.w - 4, e.y + 4);
    ctx.lineTo(e.x + 4, e.y + e.h - 4);
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#3a3548";
    ctx.fillRect(e.x + 6, e.y + e.h * 0.35, e.w - 12, 4);
    ctx.fillRect(e.x + 6, e.y + e.h * 0.55, e.w - 12, 4);
  } else {
    const throb = 0.5 + 0.5 * Math.sin(nowMs * 0.004);
    ctx.fillStyle = `rgba(80, 255, 210, ${0.28 + throb * 0.18})`;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    const lg = ctx.createLinearGradient(e.x, e.y + e.h, e.x, e.y);
    lg.addColorStop(0, "rgba(255, 255, 220, 0.15)");
    lg.addColorStop(0.45, "rgba(120, 255, 230, 0.35)");
    lg.addColorStop(1, "rgba(40, 200, 180, 0.5)");
    ctx.fillStyle = lg;
    ctx.fillRect(e.x + 2, e.y + 2, e.w - 4, e.h - 4);
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "#9fffea";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(e.x + 0.5, e.y + 0.5, e.w - 1, e.h - 1);
    ctx.globalAlpha = 0.35 + throb * 0.2;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ox = e.x + 6 + i * 8;
      ctx.beginPath();
      ctx.moveTo(ox, e.y + e.h - 4);
      ctx.lineTo(ox + 3, e.y + 8);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.font = locked ? "10px system-ui" : "bold 10px system-ui";
  ctx.fillStyle = locked ? "#aa8890" : "#0a2820";
  ctx.textAlign = "center";
  ctx.fillText(locked ? "SEALED" : "OPEN", cx, e.y + e.h + 14);
  ctx.textAlign = "left";
  ctx.restore();
}

/**
 * Unstable fusion read by channel — flash frame + sustained Pure “route sense”.
 * Bio: organic tear / splatter; Mecha: hard tech brackets; Pure: spectral double rim.
 */
function drawUnstableAshPresentation(
  ctx: CanvasRenderingContext2D,
  ash: Ash,
  cameraX: number,
  nowMs: number,
): void {
  const cx = ash.x + ash.width / 2;
  const cy = ash.y + ash.height / 2;
  const ch = ash.unstableChannel;

  if (ash.unstableFlashMs > 0 && ch !== null) {
    const f = Math.min(1, ash.unstableFlashMs / 220);
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);

    if (ch === 0) {
      /* Bio: jagged “claw” strokes + hot core — feral burst. */
      ctx.globalAlpha = 0.55 * f;
      ctx.strokeStyle = "#ff2244";
      ctx.lineWidth = 2;
      ctx.lineJoin = "miter";
      for (let i = 0; i < 9; i++) {
        const base = (i / 9) * Math.PI * 2 + nowMs * 0.02;
        const len = 14 + (i % 3) * 8 + Math.sin(nowMs * 0.05 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(base) * 8, cy + Math.sin(base) * 6);
        ctx.lineTo(cx + Math.cos(base) * len, cy + Math.sin(base) * (len * 0.55));
        ctx.stroke();
      }
      ctx.globalAlpha = 0.25 * f;
      ctx.fillStyle = "rgba(255, 60, 40, 0.6)";
      for (let j = 0; j < 6; j++) {
        ctx.fillRect(
          ash.x - 4 + (j % 3) * 10,
          ash.y - 2 + Math.floor(j / 3) * 12,
          6 + (j % 2) * 4,
          4,
        );
      }
      ctx.strokeStyle = "#ff6655";
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.9 * f;
      ctx.strokeRect(ash.x - 3, ash.y - 3, ash.width + 6, ash.height + 6);
    } else if (ch === 1) {
      /* Mecha: crisp corners + cold highlight — sharp, industrial. */
      ctx.globalAlpha = 0.85 * f;
      ctx.strokeStyle = "#66d4ff";
      ctx.lineWidth = 2;
      const s = 5;
      const corners: [number, number, number, number][] = [
        [ash.x, ash.y, 1, 1],
        [ash.x + ash.width, ash.y, -1, 1],
        [ash.x, ash.y + ash.height, 1, -1],
        [ash.x + ash.width, ash.y + ash.height, -1, -1],
      ];
      for (const [px, py, sx, sy] of corners) {
        ctx.beginPath();
        ctx.moveTo(px, py + sy * s * 2);
        ctx.lineTo(px, py);
        ctx.lineTo(px + sx * s * 2, py);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.4 * f;
      ctx.fillStyle = "rgba(100, 200, 255, 0.35)";
      ctx.fillRect(ash.x + 2, ash.y + ash.height * 0.2, ash.width - 4, 4);
      ctx.strokeStyle = "#a8f0ff";
      ctx.lineWidth = 2;
      ctx.globalAlpha = f;
      ctx.strokeRect(ash.x - 2, ash.y - 2, ash.width + 4, ash.height + 4);
    } else {
      /* Pure flash: eerie twin-color rim. */
      const drift = Math.sin(nowMs * 0.008) * 2;
      ctx.globalAlpha = 0.5 * f;
      ctx.strokeStyle = "#c8b8ff";
      ctx.lineWidth = 3;
      ctx.strokeRect(ash.x - 4 + drift, ash.y - 4, ash.width + 8, ash.height + 8);
      ctx.globalAlpha = 0.65 * f;
      ctx.strokeStyle = "#7fffd4";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ash.x - 1 - drift, ash.y - 1, ash.width + 2, ash.height + 2);
    }
    ctx.restore();
  }

  /* Pure sustained: slow spectral shimmer while perception is active. */
  if (ch === 2 && ash.perceptionRemainingMs > 0) {
    const slow = Math.sin(nowMs * 0.0025);
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);
    ctx.globalAlpha = 0.18 + slow * 0.1;
    ctx.strokeStyle = "#b0a8ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.strokeRect(ash.x - 5, ash.y - 5, ash.width + 10, ash.height + 10);
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.12 + slow * 0.06;
    ctx.strokeStyle = "#88ffe8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, ash.height * 0.85 + slow * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/** World-space context (caller already applied camera translate). */
function drawMinibossWarning(
  ctx: CanvasRenderingContext2D,
  en: PatrolEnemy,
  ash: GameState["ash"],
  nowMs: number,
): void {
  if (!en.isMiniboss) return;
  const acx = ash.x + ash.width / 2;
  const ecx = en.x + en.w / 2;
  const dx = Math.abs(acx - ecx);
  const dy = Math.abs(ash.y + ash.height / 2 - (en.y + en.h / 2));
  if (dx > 130 || dy > 70) return;
  const toward =
    (en.vx > 0 && ecx < acx) || (en.vx < 0 && ecx > acx) ? 1 : 0.45;
  const pulse = 0.5 + 0.5 * Math.sin(nowMs * 0.012);
  ctx.save();
  ctx.globalAlpha = 0.2 + pulse * 0.25 * toward;
  ctx.strokeStyle = "#ff4466";
  ctx.lineWidth = 2 + pulse * 2;
  ctx.strokeRect(en.x - 4, en.y - 4, en.w + 8, en.h + 8);
  ctx.globalAlpha = 0.15 * pulse * toward;
  ctx.fillStyle = "#ff2200";
  ctx.fillRect(en.x - 4, en.y - 4, en.w + 8, en.h + 8);
  ctx.restore();
}

/** World + entities (camera-space). */
export function drawWorld(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scratch: RenderScratch,
  nowMs: number,
): void {
  const { level, ash, enemies, cameraX, phase } = state;
  const exitLocked = minibossAlive(enemies);

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

  ctx.restore();
  drawHazardsAnimated(ctx, level, cameraX, nowMs);

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  for (const e of level.entities) {
    if (e.kind !== "checkpoint") continue;
    drawCheckpointVisual(ctx, e, nowMs);
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
    drawExitVisual(ctx, e, exitLocked, nowMs);
  }

  for (const en of enemies) {
    drawMinibossWarning(ctx, en, ash, nowMs);
  }

  for (const en of enemies) {
    const hitFlash = en.hurtCooldownMs > 0 ? en.hurtCooldownMs / 380 : 0;
    const base = en.isMiniboss ? "#8b5cf6" : "#e85555";
    ctx.fillStyle = base;
    if (hitFlash > 0) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgb(${230 + 25 * hitFlash}, ${230 + 25 * hitFlash}, ${255})`;
    }
    ctx.fillRect(en.x, en.y, en.w, en.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hitFlash > 0.3 ? "#fff" : "#fff";
    ctx.lineWidth = hitFlash > 0.2 ? 2 : 1;
    ctx.strokeRect(en.x, en.y, en.w, en.h);
  }

  ctx.restore();

  drawDeathBursts(ctx, scratch, cameraX);
  drawDashTrails(ctx, scratch, cameraX, ash.facing);
  drawLandingBurst(ctx, ash, cameraX, scratch);

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  if (phase === "playing" || phase === "won") {
    const dmgFlash = scratch.playerHitFlashMs > 0;
    const invulnBlink =
      ash.invulnMs > 0 && Math.floor(ash.invulnMs / 80) % 2 === 1;
    let fill = "#d4a88c";
    if (dmgFlash) {
      const u = scratch.playerHitFlashMs / PLAYER_HIT_FLASH_MS;
      fill = `rgb(${220 + Math.floor(35 * u)}, ${140 - Math.floor(40 * u)}, ${140 - Math.floor(30 * u)})`;
    } else if (invulnBlink) {
      fill = "#888";
    }
    ctx.fillStyle = fill;
    ctx.fillRect(ash.x, ash.y, ash.width, ash.height);
    if (dmgFlash) {
      ctx.globalAlpha = scratch.playerHitFlashMs / PLAYER_HIT_FLASH_MS * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(ash.x - 1, ash.y - 1, ash.width + 2, ash.height + 2);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.strokeRect(ash.x, ash.y, ash.width, ash.height);
  }

  ctx.restore();

  drawUnstableAshPresentation(ctx, ash, cameraX, nowMs);

  drawSlashArc(ctx, ash, cameraX);

  if (ash.hitbox.active) {
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(ash.hitbox.x, ash.hitbox.y, ash.hitbox.w, ash.hitbox.h);
    ctx.restore();
  }
}

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scratch: RenderScratch,
  nowMs: number,
  frameDtMs: number,
): void {
  advanceScratch(scratch, state, frameDtMs);

  ctx.fillStyle = "#07080d";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawWorld(ctx, state, scratch, nowMs);
  drawHitStopScreenAccent(ctx, state.hitStopRemainingMs);
  drawHud(ctx, state);
}
