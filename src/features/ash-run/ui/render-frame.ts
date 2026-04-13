import {
  ATTACK_ACTIVE_MS,
  CAMERA_SMOOTH_SNAP_PX,
  CAMERA_SMOOTH_TAU_MS,
  HIT_STOP_MS,
  PERCEPTION_MS,
  PERCEPTION_READ_DURATION_MS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "../core/constants";
import { ashBounds, rectsOverlap } from "../core/collision";
import type { GameState } from "../core/types";
import { getVisibleTimeShadows } from "../perception/timeShadowSystem";
import type { Ash, PatrolEnemy } from "../entities/types";
import { isHazard } from "../level/queries";
import { drawAuthoredTraces } from "./draw-authored-traces";
import { drawHud, type HudDrawOptions } from "./hud";

/**
 * Time-shadow perception — render-only layers (no HUD here):
 *
 * 1) `drawTimeShadowOverlays` — consumes `getVisibleTimeShadows`: Ash trail, enemy buffer
 *    polylines, danger echo loci, thinned route hints (sparse; not a GPS line).
 * 2) `drawHazardPerceptionRead` — cool spectral framing on hazard volumes while read is on.
 * 3) `drawEnemyPerceptionGhosts` — scratch-based motion echoes behind live actors.
 * 4) `drawAshPerceptionLayer` — soft aura / dashed frame after Ash is drawn (readability first).
 *
 * All use low alpha; `senseStrength` and `edgeFade` gate intensity to avoid clutter.
 */

/** Ramp perception overlays in/out so bursts don’t pop on/off. */
const PERCEPTION_EDGE_FADE_MS = 280;

function timeShadowEdgeFade(ash: Ash): number {
  let m = 0;
  if (ash.fusionPureSenseMs > 0) {
    const total = PERCEPTION_MS;
    const r = ash.fusionPureSenseMs;
    const e = total - r;
    const fi = Math.min(1, e / PERCEPTION_EDGE_FADE_MS);
    const fo = Math.min(1, r / PERCEPTION_EDGE_FADE_MS);
    m = Math.max(m, fi * fo);
  }
  if (ash.perceptionRemainingMs > 0) {
    const total = PERCEPTION_READ_DURATION_MS;
    const r = ash.perceptionRemainingMs;
    const e = total - r;
    const fi = Math.min(1, e / PERCEPTION_EDGE_FADE_MS);
    const fo = Math.min(1, r / PERCEPTION_EDGE_FADE_MS);
    m = Math.max(m, fi * fo);
  }
  return m;
}

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
  /** Faint enemy movement ghosts — baseline perception read (render-only). */
  enemyGhostTrails: Map<
    string,
    Array<{ x: number; y: number; life: number }>
  >;
  /** Short localized tension spikes (render-only); decay each frame. */
  tensionGateMs: number;
  tensionHazardMs: number;
  tensionMinibossInnerMs: number;
  tensionLowHpMs: number;
  tensionExitOpenMs: number;
  prevBossGateTriggered: boolean;
  prevMinibossInner: boolean;
  prevMinibossAlive: boolean;
  /** Edge fade timers — screen-space only; no sim impact. */
  checkpointPulseMs: number;
  readSpaceOpenMs: number;
  prevPerceptionReadMs: number;
  unstableReadyPulseMs: number;
  prevUnstableCooldownMs: number;
  /** Eased toward `GameState.cameraX` each frame — sim stays authoritative. */
  smoothedCameraX: number;
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
    enemyGhostTrails: new Map(),
    tensionGateMs: 0,
    tensionHazardMs: 0,
    tensionMinibossInnerMs: 0,
    tensionLowHpMs: 0,
    tensionExitOpenMs: 0,
    prevBossGateTriggered: false,
    prevMinibossInner: false,
    prevMinibossAlive: false,
    checkpointPulseMs: 0,
    readSpaceOpenMs: 0,
    prevPerceptionReadMs: 0,
    unstableReadyPulseMs: 0,
    prevUnstableCooldownMs: 0,
    smoothedCameraX: 0,
    initialized: false,
  };
}

function updateSmoothedCamera(
  scratch: RenderScratch,
  targetX: number,
  frameDtMs: number,
): number {
  const dt = Math.min(Math.max(frameDtMs, 1), 80);
  let s = scratch.smoothedCameraX;
  const d = Math.abs(targetX - s);
  if (d > CAMERA_SMOOTH_SNAP_PX) {
    s = targetX;
  } else if (d > 0.015) {
    const a = 1 - Math.exp(-dt / CAMERA_SMOOTH_TAU_MS);
    s += (targetX - s) * a;
  } else {
    s = targetX;
  }
  scratch.smoothedCameraX = s;
  return s;
}

const LAND_VY_THRESHOLD = 260;
const LAND_BURST_DURATION_MS = 240;
const PLAYER_HIT_FLASH_MS = 320;
const DEATH_BURST_DRONE_MS = 380;
const DEATH_BURST_BOSS_MS = 520;
const DASH_TRAIL_MAX = 7;
const DASH_TRAIL_DECAY_PER_MS = 0.0045;
const ENEMY_GHOST_DECAY_PER_MS = 1 / 400;
const ENEMY_GHOST_MIN_DIST = 6;
const ENEMY_GHOST_MAX = 7;

/** Situational tension spikes — localized only; no persistent overlays. */
const TENSION_GATE_MS = 420;
const TENSION_HAZARD_MS = 220;
const TENSION_INNER_MS = 280;
const TENSION_LOWHP_MS = 380;
const TENSION_EXIT_MS = 520;
const CHECKPOINT_PULSE_MS = 420;
const READ_SPACE_OPEN_MS = 260;
const UNSTABLE_READY_PULSE_MS = 340;

function minibossInnerThreat(state: GameState): boolean {
  const { ash, enemies } = state;
  const acx = ash.x + ash.width / 2;
  const acy = ash.y + ash.height / 2;
  for (const en of enemies) {
    if (!en.isMiniboss || en.hp <= 0) continue;
    const ecx = en.x + en.w / 2;
    const ecy = en.y + en.h / 2;
    if (Math.abs(acx - ecx) < 72 && Math.abs(acy - ecy) < 48) return true;
  }
  return false;
}

function advanceScratch(
  scratch: RenderScratch,
  state: GameState,
  frameDtMs: number,
): void {
  const dt = Math.min(frameDtMs, 48);
  scratch.landingBurstMs = Math.max(0, scratch.landingBurstMs - dt);
  scratch.playerHitFlashMs = Math.max(0, scratch.playerHitFlashMs - dt);
  scratch.tensionGateMs = Math.max(0, scratch.tensionGateMs - dt);
  scratch.tensionHazardMs = Math.max(0, scratch.tensionHazardMs - dt);
  scratch.tensionMinibossInnerMs = Math.max(0, scratch.tensionMinibossInnerMs - dt);
  scratch.tensionLowHpMs = Math.max(0, scratch.tensionLowHpMs - dt);
  scratch.tensionExitOpenMs = Math.max(0, scratch.tensionExitOpenMs - dt);
  scratch.checkpointPulseMs = Math.max(0, scratch.checkpointPulseMs - dt);
  scratch.readSpaceOpenMs = Math.max(0, scratch.readSpaceOpenMs - dt);
  scratch.unstableReadyPulseMs = Math.max(0, scratch.unstableReadyPulseMs - dt);

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

    if (!scratch.prevBossGateTriggered && state.bossGateTriggered) {
      scratch.tensionGateMs = TENSION_GATE_MS;
    }
    if (hpDrop) {
      const ar = ashBounds(ash);
      let overHazard = false;
      for (const ent of state.level.entities) {
        if (!isHazard(ent)) continue;
        if (rectsOverlap(ar, ent)) {
          overHazard = true;
          break;
        }
      }
      if (overHazard) scratch.tensionHazardMs = TENSION_HAZARD_MS;
    }
    const innerThreat = minibossInnerThreat(state);
    if (innerThreat && !scratch.prevMinibossInner) {
      scratch.tensionMinibossInnerMs = TENSION_INNER_MS;
    }
    const ceilNow = Math.ceil(ash.hp);
    const ceilPrev = Math.ceil(scratch.prevAsh.hp);
    if (ceilNow === 1 && ceilPrev > 1) {
      scratch.tensionLowHpMs = TENSION_LOWHP_MS;
    }
    const minibossAlive = state.enemies.some((e) => e.isMiniboss && e.hp > 0);
    if (state.bossGateTriggered && scratch.prevMinibossAlive && !minibossAlive) {
      scratch.tensionExitOpenMs = TENSION_EXIT_MS;
    }

    if (
      ash.hp >= ash.maxHp - 0.01 &&
      scratch.prevAsh.hp < ash.maxHp - 0.08
    ) {
      scratch.checkpointPulseMs = CHECKPOINT_PULSE_MS;
    }
    if (
      ash.perceptionRemainingMs > 0 &&
      scratch.prevPerceptionReadMs <= 0
    ) {
      scratch.readSpaceOpenMs = READ_SPACE_OPEN_MS;
    }
    if (
      scratch.prevUnstableCooldownMs > 0 &&
      ash.unstableCooldownMs <= 0
    ) {
      scratch.unstableReadyPulseMs = UNSTABLE_READY_PULSE_MS;
    }

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

  for (const en of state.enemies) {
    let trail = scratch.enemyGhostTrails.get(en.id) ?? [];
    const cx = en.x + en.w / 2;
    const cy = en.y + en.h / 2;
    const head = trail[0];
    const dist = head ? Math.hypot(head.x - cx, head.y - cy) : 999;
    if (!head || dist >= ENEMY_GHOST_MIN_DIST) {
      trail.unshift({ x: cx, y: cy, life: 1 });
    } else {
      trail[0] = { x: cx, y: cy, life: trail[0]!.life };
    }
    for (const p of trail) {
      p.life -= dt * ENEMY_GHOST_DECAY_PER_MS;
    }
    trail = trail.filter((p) => p.life > 0.06);
    if (trail.length > ENEMY_GHOST_MAX) trail.length = ENEMY_GHOST_MAX;
    scratch.enemyGhostTrails.set(en.id, trail);
  }
  for (const id of scratch.enemyGhostTrails.keys()) {
    if (!state.enemies.some((e) => e.id === id)) {
      scratch.enemyGhostTrails.delete(id);
    }
  }

  scratch.prevAsh = {
    grounded: ash.grounded,
    vy: ash.vy,
    hp: ash.hp,
    invulnMs: ash.invulnMs,
  };

  scratch.prevBossGateTriggered = state.bossGateTriggered;
  scratch.prevMinibossInner = minibossInnerThreat(state);
  scratch.prevMinibossAlive = state.enemies.some(
    (e) => e.isMiniboss && e.hp > 0,
  );
  scratch.prevPerceptionReadMs = ash.perceptionRemainingMs;
  scratch.prevUnstableCooldownMs = ash.unstableCooldownMs;

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
  ctx.strokeStyle = "#e8fbff";
  ctx.lineWidth = 3 + flash * 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(hx, hy, r, start, start + sweep, ash.facing !== 1);
  ctx.stroke();
  ctx.globalAlpha = flash * 0.35;
  ctx.strokeStyle = "#40d8ff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(hx, hy, r + 3, start, start + sweep, ash.facing !== 1);
  ctx.stroke();
  ctx.restore();
}

/** Left-edge seal read — boss gate crossed; fades with tensionGateMs. */
function drawGateSealSpike(
  ctx: CanvasRenderingContext2D,
  tensionGateMs: number,
): void {
  if (tensionGateMs <= 0) return;
  const u = tensionGateMs / TENSION_GATE_MS;
  ctx.save();
  ctx.globalAlpha = 0.05 + u * 0.09;
  const g = ctx.createLinearGradient(0, 0, 32, 0);
  g.addColorStop(0, "rgba(255, 55, 40, 0.95)");
  g.addColorStop(1, "rgba(255, 55, 40, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 36, VIEW_HEIGHT);
  ctx.restore();
}

/** Acid bite — hazard damage tick; bright inner stroke on hazard tiles only. */
function drawHazardTensionSpike(
  ctx: CanvasRenderingContext2D,
  level: GameState["level"],
  cameraX: number,
  tensionHazardMs: number,
): void {
  if (tensionHazardMs <= 0) return;
  const u = tensionHazardMs / TENSION_HAZARD_MS;
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  ctx.globalAlpha = 0.25 + u * 0.55;
  ctx.strokeStyle = "rgba(255, 255, 240, 0.95)";
  ctx.lineWidth = 2;
  for (const e of level.entities) {
    if (e.kind !== "hazard") continue;
    ctx.strokeRect(e.x - 1, e.y - 1, e.w + 2, e.h + 2);
  }
  ctx.restore();
}

function drawHazardsAnimated(
  ctx: CanvasRenderingContext2D,
  level: GameState["level"],
  cameraX: number,
  nowMs: number,
  hazardPulseMul: number,
): void {
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  const pm = hazardPulseMul;
  for (const e of level.entities) {
    if (e.kind !== "hazard") continue;
    const wave =
      0.5 +
      0.5 *
        Math.sin(nowMs * 0.005 * pm + e.x * 0.012 + e.y * 0.009);
    const baseA = 0.28 + wave * 0.12;
    /* Mario-hot core + Mega-cyan rim — “fusion spill” read. */
    ctx.fillStyle = `rgba(255, 95, 55, ${baseA * 0.72})`;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = `rgba(45, 220, 255, ${baseA * 0.55})`;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = `rgba(255, 200, 120, ${0.1 + wave * 0.08})`;
    ctx.fillRect(e.x + 2, e.y + 2, e.w - 4, Math.max(2, (e.h - 4) * 0.35));
    ctx.strokeStyle = `rgba(200, 255, 255, ${0.65 + wave * 0.22})`;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(e.x + 0.5, e.y + 0.5, e.w - 1, e.h - 1);
    ctx.strokeStyle = "rgba(255, 255, 220, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(e.x + 3, e.y + 3, e.w - 6, e.h - 6);
  }
  ctx.restore();
}

/**
 * Hazard read — dashed outer read + inner “danger band” shimmer (no solid wash).
 * `strength` includes edge fade.
 */
function drawHazardPerceptionRead(
  ctx: CanvasRenderingContext2D,
  level: GameState["level"],
  cameraX: number,
  nowMs: number,
  strength: number,
): void {
  if (strength < 0.02) return;
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);
  const baseAlpha = (0.028 + strength * 0.08) * 0.88;
  for (const e of level.entities) {
    if (e.kind !== "hazard") continue;
    const wave = Math.sin(nowMs * 0.004 + e.x * 0.01);
    const ins = 3;
    /* Inner remembered-danger band: thin horizontal shimmer, clipped to hazard */
    ctx.save();
    ctx.beginPath();
    ctx.rect(e.x + ins, e.y + ins, e.w - ins * 2, e.h - ins * 2);
    ctx.clip();
    const bandH = Math.max(4, e.h * 0.22);
    const by = e.y + e.h - bandH - ins * 0.5;
    const sh = ctx.createLinearGradient(e.x, by, e.x + e.w, by + bandH);
    const shim = 0.045 + wave * 0.025;
    sh.addColorStop(0, `rgba(100, 200, 190, ${shim * strength})`);
    sh.addColorStop(0.5, `rgba(160, 235, 255, ${shim * 1.1 * strength})`);
    sh.addColorStop(1, `rgba(90, 160, 200, ${shim * 0.7 * strength})`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = sh;
    ctx.fillRect(e.x + ins, by, e.w - ins * 2, bandH);
    ctx.restore();

    ctx.globalAlpha = baseAlpha * (0.82 + wave * 0.18);
    ctx.strokeStyle = "rgba(115, 215, 195, 0.38)";
    ctx.lineWidth = 1;
    ctx.setLineDash([7, 11]);
    ctx.strokeRect(e.x + 2, e.y + 2, e.w - 4, e.h - 4);
    ctx.setLineDash([]);
    ctx.globalAlpha = (0.02 + strength * 0.068) * (0.75 + wave * 0.25);
    ctx.strokeStyle = "rgba(185, 225, 255, 0.28)";
    ctx.beginPath();
    ctx.moveTo(e.x + 5, e.y + e.h * 0.5);
    ctx.lineTo(e.x + e.w - 5, e.y + e.h * 0.5);
    ctx.stroke();
    if (strength > 0.1) {
      ctx.globalAlpha = baseAlpha * 0.38 * strength;
      ctx.strokeStyle = "rgba(195, 218, 255, 0.32)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([4, 6]);
      ctx.strokeRect(e.x + ins + 2, e.y + ins + 2, e.w - (ins + 2) * 2, e.h - (ins + 2) * 2);
      ctx.setLineDash([]);
    }
  }
  ctx.restore();
}

/** World-space — caller must have applied camera translate. */
function drawEnemyPerceptionGhosts(
  ctx: CanvasRenderingContext2D,
  enemies: PatrolEnemy[],
  scratch: RenderScratch,
  strength: number,
): void {
  if (strength < 0.02) return;
  ctx.save();
  const boost = strength;
  for (const en of enemies) {
    const trail = scratch.enemyGhostTrails.get(en.id);
    if (!trail || trail.length < 2) continue;
    const rw = en.isMiniboss ? 10 : 6;
    const col = en.isMiniboss
      ? { line: "rgba(165, 145, 255, 0.34)", dot: "rgba(175, 155, 255, 0.42)" }
      : { line: "rgba(88, 205, 195, 0.3)", dot: "rgba(105, 215, 205, 0.38)" };
    /* Primary motion line — oldest → newest */
    ctx.beginPath();
    ctx.moveTo(trail[trail.length - 1]!.x, trail[trail.length - 1]!.y);
    for (let i = trail.length - 2; i >= 0; i--) {
      ctx.lineTo(trail[i]!.x, trail[i]!.y);
    }
    ctx.globalAlpha = (0.022 + boost * 0.085) * (trail[0]?.life ?? 1);
    ctx.strokeStyle = col.line;
    ctx.lineWidth = 0.95;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    /* Secondary offset echo — sells lateral patrol without doubling brightness */
    ctx.beginPath();
    const off = en.isMiniboss ? 2.2 : 1.4;
    ctx.moveTo(trail[trail.length - 1]!.x + off, trail[trail.length - 1]!.y - off * 0.4);
    for (let i = trail.length - 2; i >= 0; i--) {
      ctx.lineTo(trail[i]!.x + off, trail[i]!.y - off * 0.4);
    }
    ctx.globalAlpha = (0.014 + boost * 0.055) * (trail[0]?.life ?? 1);
    ctx.strokeStyle = col.line;
    ctx.lineWidth = 0.65;
    ctx.stroke();

    for (let i = trail.length - 1; i >= 0; i -= 2) {
      const p = trail[i]!;
      const a = p.life * (0.03 + boost * 0.1);
      if (a < 0.012) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = col.dot;
      const s = rw * (0.4 + 0.5 * p.life);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, s, s * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Ash read layer — spectral rim + soft field (render-only). Drawn after body; low alpha.
 * `strength` includes edge fade (route × burst ramp).
 */
function drawAshPerceptionLayer(
  ctx: CanvasRenderingContext2D,
  ash: Ash,
  cameraX: number,
  nowMs: number,
  strength: number,
): void {
  if (strength < 0.03) return;

  const cx = ash.x + ash.width / 2;
  const cy = ash.y + ash.height / 2;
  const drift = Math.sin(nowMs * 0.0016) * 0.5;
  const breath = 0.5 + 0.5 * Math.sin(nowMs * 0.0029);
  const spec = Math.sin(nowMs * 0.004 + cx * 0.01) * 0.5 + 0.5;
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  const r0 = ash.height * (0.92 + breath * 0.05);
  const r1 = ash.height * (1.28 + breath * 0.07);
  const g0 = ctx.createRadialGradient(cx, cy - 4, 1, cx, cy, r0);
  g0.addColorStop(0, `rgba(195, 228, 255, ${0.052 * strength})`);
  g0.addColorStop(0.55, `rgba(130, 185, 215, ${0.028 * strength})`);
  g0.addColorStop(1, "rgba(35, 55, 85, 0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = g0;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, r0 * 0.84, r0 * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  const g1 = ctx.createRadialGradient(cx + 2, cy + 3, 0, cx, cy, r1);
  g1.addColorStop(0, `rgba(175, 155, 255, ${0.038 * strength * (0.85 + spec * 0.15)})`);
  g1.addColorStop(0.6, `rgba(95, 135, 195, ${0.018 * strength})`);
  g1.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r1 * 0.88, r1 * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.03 * strength * breath;
  ctx.strokeStyle = "rgba(165, 208, 255, 0.42)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy + 1, ash.height * 0.46, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  ctx.globalAlpha = 0.026 + strength * 0.078;
  ctx.strokeStyle = "rgba(150, 210, 200, 0.55)";
  ctx.lineWidth = 1;
  ctx.setLineDash([9, 14]);
  ctx.strokeRect(ash.x - 2 + drift, ash.y - 2, ash.width + 4, ash.height + 4);
  ctx.setLineDash([]);

  if (strength > 0.06) {
    const slow = Math.sin(nowMs * 0.0024);
    ctx.globalAlpha = (0.065 + slow * 0.04 + strength * 0.045) * 0.82;
    ctx.strokeStyle = "rgba(175, 165, 255, 0.55)";
    ctx.lineWidth = 1.05;
    ctx.setLineDash([3, 7]);
    ctx.strokeRect(ash.x - 3, ash.y - 3, ash.width + 6, ash.height + 6);
    ctx.setLineDash([]);
    ctx.globalAlpha = (0.055 + slow * 0.035 + strength * 0.035) * 0.82;
    ctx.strokeStyle = "rgba(120, 235, 220, 0.42)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, ash.height * 0.78 + slow * 2, 0, Math.PI * 2);
    ctx.stroke();
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
  ctx.fillStyle = "#fff6e8";
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

/** Checkpoint: bookmark beacon — parchment + gold (book motif). */
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
  ctx.globalAlpha = 0.14 + pulse * 0.16;
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x - pad, e.y - pad, e.w + pad * 2, e.h + pad * 2);
  ctx.globalAlpha = 0.08 + pulse * 0.1;
  ctx.strokeStyle = "#e8d48a";
  ctx.lineWidth = 2;
  const pad2 = pad + 8;
  ctx.strokeRect(e.x - pad2, e.y - pad2, e.w + pad2 * 2, e.h + pad2 * 2);

  ctx.globalAlpha = 0.42 + pulse * 0.28;
  ctx.fillStyle = "rgba(220, 190, 120, 0.38)";
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.globalAlpha = 0.55 + pulse * 0.25;
  const rg = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(e.w, e.h) * 1.4);
  rg.addColorStop(0, "rgba(255, 235, 190, 0.55)");
  rg.addColorStop(1, "rgba(140, 100, 40, 0)");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(e.w, e.h) * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f8edd2";
  ctx.strokeStyle = "rgba(92, 62, 22, 0.75)";
  ctx.lineWidth = 2;
  ctx.font = 'bold 12px Georgia, "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.strokeText("MARK", cx, e.y + 26);
  ctx.fillText("MARK", cx, e.y + 26);
  ctx.textAlign = "left";
  ctx.restore();
}

function minibossAlive(enemies: PatrolEnemy[]): boolean {
  return enemies.some((en) => en.isMiniboss && en.hp > 0);
}

/**
 * Escape arc — drives subtle clear tint, hazard pulse, solids read, exit throb.
 * 0 early lab · 1 lockdown mid · 2 post-seal finale (no new sim systems).
 */
function escapePressurePhase(state: GameState): 0 | 1 | 2 {
  if (state.phase !== "playing") return 0;
  if (!state.bossGateTriggered) {
    return state.ash.x < 1780 ? 0 : 1;
  }
  return 2;
}

function clearColorForPressure(phase: 0 | 1 | 2): string {
  /* Warm ink — “reading a book by lamplight” vs cold lab steel. */
  if (phase === 0) return "#1a1612";
  if (phase === 1) return "#181410";
  return "#1c1214";
}

/** Very light edge weight — finale only; keeps HUD readable. */
function drawEscapeFinaleTint(
  ctx: CanvasRenderingContext2D,
  phase: 0 | 1 | 2,
): void {
  if (phase < 2) return;
  ctx.save();
  const g = ctx.createRadialGradient(
    VIEW_WIDTH * 0.5,
    VIEW_HEIGHT * 0.52,
    VIEW_HEIGHT * 0.22,
    VIEW_WIDTH * 0.5,
    VIEW_HEIGHT * 0.5,
    Math.max(VIEW_WIDTH, VIEW_HEIGHT) * 0.78,
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(22, 6, 10, 0.065)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.restore();
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
  escapePhase: 0 | 1 | 2,
  unlockSpikeMs: number,
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
    const pulseHz = 0.004 + escapePhase * 0.003;
    const spikeBoost = unlockSpikeMs > 0 ? unlockSpikeMs / TENSION_EXIT_MS : 0;
    const throb = 0.5 + 0.5 * Math.sin(nowMs * (pulseHz + spikeBoost * 0.004));
    ctx.fillStyle = `rgba(80, 255, 210, ${0.28 + throb * 0.18 + spikeBoost * 0.12})`;
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
}

/** World-space context (caller already applied camera translate). */
function drawMinibossWarning(
  ctx: CanvasRenderingContext2D,
  en: PatrolEnemy,
  ash: GameState["ash"],
  nowMs: number,
  innerSpikeMs: number,
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
  if (innerSpikeMs > 0) {
    const u = innerSpikeMs / TENSION_INNER_MS;
    ctx.globalAlpha = 0.35 + u * 0.4;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3 + u * 2;
    ctx.strokeRect(en.x - 7, en.y - 7, en.w + 14, en.h + 14);
  }
  ctx.restore();
}

function drawBossGateVisual(
  ctx: CanvasRenderingContext2D,
  e: { x: number; y: number; w: number; h: number },
  ash: Ash,
  nowMs: number,
  gateTriggered: boolean,
): void {
  const cx = e.x + e.w / 2;
  const acx = ash.x + ash.width / 2;
  const near = Math.abs(acx - cx) < 400;
  const alarm = gateTriggered || near;
  const pulse = 0.5 + 0.5 * Math.sin(nowMs * (alarm ? 0.012 : 0.005));
  ctx.save();
  if (alarm) {
    ctx.fillStyle = `rgba(${22 + pulse * 38}, ${10 + pulse * 12}, ${28 + pulse * 18}, 0.94)`;
  } else {
    ctx.fillStyle = "#1a1528";
  }
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = alarm
    ? `rgba(${210 + pulse * 45}, ${35 + pulse * 40}, ${55 + pulse * 50}, 0.96)`
    : "#6b4fff";
  ctx.lineWidth = alarm ? 3 : 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  if (alarm) {
    ctx.globalAlpha = 0.18 + pulse * 0.22;
    ctx.fillStyle = "#ff2200";
    ctx.fillRect(e.x + 2, e.y + e.h * 0.18, e.w - 4, 4);
    ctx.globalAlpha = 0.12 + pulse * 0.1;
    ctx.fillRect(e.x + 2, e.y + e.h * 0.55, e.w - 4, 2);
  }
  ctx.restore();
}

/**
 * `getVisibleTimeShadows` → world-space drawing. Route = sparse markers + whisper spine
 * (not a bright GPS). Hazards = memory bloom + ring, not fullscreen tint.
 */
function drawTimeShadowOverlays(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cameraX: number,
  nowMs: number,
  edgeFade: number,
  ash: Ash,
): void {
  const vis = getVisibleTimeShadows(state.timeShadow, state);
  if (!vis.active || edgeFade < 0.04) return;

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  const flick = 0.58 + 0.42 * Math.sin(nowMs * 0.0055 + cameraX * 0.00035);
  const wobble = Math.sin(nowMs * 0.009) * 0.9;

  /* --- Route hints: tick markers + very faint broken spine (readable space, not navigation UI) --- */
  if (vis.suggestedPath.length >= 2) {
    const path = vis.suggestedPath;
    const markA = 0.055 * edgeFade * flick;
    const step = Math.max(1, Math.floor(path.length / 9));
    for (let i = 0; i < path.length; i += step) {
      const p = path[i]!;
      ctx.globalAlpha = markA * (0.65 + (i / path.length) * 0.35);
      ctx.fillStyle = "rgba(175, 215, 255, 0.55)";
      ctx.beginPath();
      ctx.arc(p.x + wobble * 0.2, p.y, 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.045 * edgeFade * flick;
    ctx.strokeStyle = "rgba(155, 200, 240, 0.35)";
    ctx.lineWidth = 0.65;
    ctx.setLineDash([2, 10, 3, 12]);
    ctx.lineDashOffset = (nowMs * 0.012) % 40;
    ctx.beginPath();
    ctx.moveTo(path[0]!.x, path[0]!.y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i]!.x, path[i]!.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }

  /* --- Authored traces: survivor spines, victim frays, patrol whispers --- */
  drawAuthoredTraces(ctx, vis.authoredTraces, nowMs, edgeFade, flick);

  /* --- Hazard echo (memory): tight bloom + thin ring — where danger was felt --- */
  for (const h of vis.dangerHints) {
    const cx = h.x + h.w / 2;
    const cy = h.y + h.h / 2;
    const rad = Math.max(h.w, h.h) * 0.55 + 3;
    const inten = h.intensity * edgeFade;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, `rgba(120, 200, 225, ${0.09 * inten})`);
    g.addColorStop(0.5, `rgba(85, 140, 185, ${0.045 * inten})`);
    g.addColorStop(1, "rgba(40, 55, 80, 0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rad, rad * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.22 * inten * flick;
    ctx.strokeStyle = "rgba(150, 210, 235, 0.4)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rad * 0.92, rad * 0.66, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.085 * inten * flick;
    ctx.strokeStyle = "rgba(175, 225, 255, 0.28)";
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.moveTo(h.x, cy + Math.sin(nowMs * 0.016 + cx * 0.04) * 1.2);
    ctx.lineTo(h.x + h.w, cy - Math.sin(nowMs * 0.014 + cx * 0.035) * 1);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* --- Ash trace from buffer: tapering segments + soft echoes (not a solid beam) --- */
  const ashPath = vis.ashGhostPath;
  if (ashPath.length >= 2) {
    const n = ashPath.length;
    for (let i = 0; i < n - 1; i++) {
      const age = i / Math.max(1, n - 2);
      const segA = (0.045 + age * 0.11) * edgeFade;
      ctx.globalAlpha = segA;
      ctx.strokeStyle = "rgba(190, 225, 255, 0.48)";
      ctx.lineWidth = 0.65 + age * 0.28;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ashPath[i]!.x, ashPath[i]!.y);
      ctx.lineTo(ashPath[i + 1]!.x, ashPath[i + 1]!.y);
      ctx.stroke();
    }
    const echoIdx = [
      Math.floor(n * 0.25),
      Math.floor(n * 0.55),
      Math.floor(n * 0.82),
    ];
    const rw = ash.width * 0.44;
    const rh = ash.height * 0.38;
    for (const idx of echoIdx) {
      if (idx <= 0 || idx >= n) continue;
      const p = ashPath[idx]!;
      const lagA = (0.035 + (idx / n) * 0.05) * edgeFade;
      ctx.globalAlpha = lagA;
      ctx.fillStyle = "rgba(195, 230, 255, 0.18)";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = lagA * 0.45;
      ctx.strokeStyle = "rgba(155, 205, 255, 0.28)";
      ctx.lineWidth = 0.55;
      ctx.stroke();
    }
  }

  /* --- Enemy buffer trails: polyline + light whiskers at samples (route logic) --- */
  for (const [, path] of vis.enemyGhostPaths) {
    if (path.length < 2) continue;
    const n = path.length;
    for (let i = 0; i < n - 1; i++) {
      const age = i / Math.max(1, n - 2);
      const segA = (0.038 + age * 0.095) * edgeFade;
      ctx.globalAlpha = segA;
      ctx.strokeStyle = "rgba(105, 225, 200, 0.4)";
      ctx.lineWidth = 0.65 + age * 0.22;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(path[i]!.x, path[i]!.y);
      ctx.lineTo(path[i + 1]!.x, path[i + 1]!.y);
      ctx.stroke();
    }
    for (let i = 1; i < n - 1; i += 2) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * 4.5;
      const ny = (dx / len) * 3.2;
      ctx.globalAlpha = (0.04 + (i / n) * 0.06) * edgeFade;
      ctx.strokeStyle = "rgba(130, 235, 215, 0.35)";
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(a.x - nx, a.y - ny);
      ctx.lineTo(a.x + nx, a.y + ny);
      ctx.stroke();
    }
    const oldest = path[0]!;
    ctx.globalAlpha = 0.055 * edgeFade;
    ctx.fillStyle = "rgba(100, 215, 195, 0.18)";
    ctx.beginPath();
    ctx.ellipse(oldest.x, oldest.y, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Hybrid hero read: default Mega-style chassis + Mario accent energy; modes skew
 * warm (Mario-ish) / cool armor (Mega-ish) / spectral book-ink (Pure).
 */
function ashHybridBodyStyle(ash: Ash): {
  fill: string;
  stroke: string;
  lineWidth: number;
  shadowBlur: number;
  shadowColor: string;
} {
  const defaultStroke = "#0d2840";
  if (ash.fusionPureSenseMs > 0) {
    const t = Math.min(1, ash.fusionPureSenseMs / PERCEPTION_MS);
    return {
      fill: `rgb(${175 + Math.floor(30 * (1 - t))}, ${155 + Math.floor(35 * t)}, ${235 + Math.floor(20 * t)})`,
      stroke: `rgba(130, 210, 255, ${0.35 + 0.25 * t})`,
      lineWidth: 2,
      shadowBlur: 5 + t * 6,
      shadowColor: `rgba(170, 150, 255, ${0.28 + 0.2 * t})`,
    };
  }
  if (ash.perceptionRemainingMs > 0) {
    const t = Math.min(1, ash.perceptionRemainingMs / PERCEPTION_READ_DURATION_MS);
    return {
      fill: "#7eb3d8",
      stroke: `rgba(20, 70, 120, ${0.35 + 0.2 * t})`,
      lineWidth: 2,
      shadowBlur: 2 + t * 4,
      shadowColor: `rgba(180, 230, 255, ${0.2 + 0.15 * t})`,
    };
  }
  if (ash.fusionMoveMs > 0 && ash.fusionMoveChannel === 0) {
    return {
      fill: "#e85d3c",
      stroke: "#6b1f12",
      lineWidth: 2,
      shadowBlur: 0,
      shadowColor: "transparent",
    };
  }
  if (ash.fusionMoveMs > 0 && ash.fusionMoveChannel === 1) {
    return {
      fill: "#b8c4d4",
      stroke: "#1a4a78",
      lineWidth: 2,
      shadowBlur: 0,
      shadowColor: "transparent",
    };
  }
  return {
    fill: "#4a92d8",
    stroke: defaultStroke,
    lineWidth: 2,
    shadowBlur: 0,
    shadowColor: "transparent",
  };
}

/** World + entities (camera-space). */
export function drawWorld(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scratch: RenderScratch,
  nowMs: number,
): void {
  const { level, ash, enemies, cameraX, phase, bossGateTriggered } = state;
  const exitLocked = minibossAlive(enemies);
  const escPhase = escapePressurePhase(state);
  const hazardPulseMul = 1 + escPhase * 0.11;
  const pureT =
    ash.fusionPureSenseMs > 0
      ? Math.min(1, ash.fusionPureSenseMs / PERCEPTION_MS)
      : 0;
  const readT =
    ash.perceptionRemainingMs > 0
      ? Math.min(1, ash.perceptionRemainingMs / PERCEPTION_READ_DURATION_MS)
      : 0;
  const routeSenseT = Math.min(1, pureT + readT);
  const edgeFade = timeShadowEdgeFade(ash);
  const senseStrength = routeSenseT * edgeFade;

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  for (const e of level.entities) {
    if (e.kind !== "solid") continue;
    const depth = e.x / level.width;
    let br = 0.88 + depth * 0.32;
    if (escPhase === 1) br += 0.05;
    if (escPhase === 2) br += 0.1;
    const r = Math.round(210 - br * 42 + (escPhase >= 2 ? 6 : 0));
    const g = Math.round(128 - br * 28);
    const b = Math.round(78 - br * 18);
    const lip = Math.min(9, Math.max(4, e.h * 0.12));
    const gr = ctx.createLinearGradient(0, e.y, 0, e.y + lip);
    gr.addColorStop(
      0,
      `rgb(${Math.min(255, r + 32)},${Math.min(255, g + 24)},${Math.min(255, b + 14)})`,
    );
    gr.addColorStop(0.35, `rgb(${r},${g},${b})`);
    gr.addColorStop(
      1,
      `rgb(${Math.max(0, r - 22)},${Math.max(0, g - 14)},${Math.max(0, b - 10)})`,
    );
    ctx.fillStyle = gr;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = `rgb(${Math.max(0, r - 48)},${Math.max(0, g - 36)},${Math.max(0, b - 24)})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(45, 32, 22, 0.4)";
    ctx.fillRect(e.x, e.y + e.h - 2, e.w, 2);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  drawHazardsAnimated(ctx, level, cameraX, nowMs, hazardPulseMul);
  drawTimeShadowOverlays(ctx, state, cameraX, nowMs, edgeFade, ash);
  drawHazardTensionSpike(ctx, level, cameraX, scratch.tensionHazardMs);
  drawHazardPerceptionRead(ctx, level, cameraX, nowMs, senseStrength);

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  for (const e of level.entities) {
    if (e.kind !== "checkpoint") continue;
    drawCheckpointVisual(ctx, e, nowMs);
  }

  for (const e of level.entities) {
    if (e.kind !== "boss_gate") continue;
    drawBossGateVisual(ctx, e, ash, nowMs, bossGateTriggered);
  }

  for (const e of level.entities) {
    if (e.kind !== "exit") continue;
    drawExitVisual(ctx, e, exitLocked, nowMs, escPhase, scratch.tensionExitOpenMs);
  }

  drawEnemyPerceptionGhosts(ctx, enemies, scratch, senseStrength);

  for (const en of enemies) {
    drawMinibossWarning(
      ctx,
      en,
      ash,
      nowMs,
      scratch.tensionMinibossInnerMs,
    );
  }

  for (const en of enemies) {
    const hitFlash = en.hurtCooldownMs > 0 ? en.hurtCooldownMs / 380 : 0;
    const base = en.isMiniboss ? "#5c6bc0" : "#e63946";
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
    const hybrid = ashHybridBodyStyle(ash);
    let fill = hybrid.fill;
    let stroke = hybrid.stroke;
    let lineW = hybrid.lineWidth;
    if (dmgFlash) {
      const u = scratch.playerHitFlashMs / PLAYER_HIT_FLASH_MS;
      fill = `rgb(${220 + Math.floor(35 * u)}, ${140 - Math.floor(40 * u)}, ${140 - Math.floor(30 * u)})`;
      stroke = "#1a1a1a";
      lineW = 2;
    } else if (invulnBlink) {
      fill = "#9ec8ea";
      stroke = "#1a4060";
      lineW = 2;
    }
    ctx.fillStyle = fill;
    if (!dmgFlash && hybrid.shadowBlur > 0) {
      ctx.shadowBlur = hybrid.shadowBlur;
      ctx.shadowColor = hybrid.shadowColor;
    }
    ctx.fillRect(ash.x, ash.y, ash.width, ash.height);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    if (dmgFlash) {
      ctx.globalAlpha = scratch.playerHitFlashMs / PLAYER_HIT_FLASH_MS * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(ash.x - 1, ash.y - 1, ash.width + 2, ash.height + 2);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineW;
    ctx.strokeRect(ash.x, ash.y, ash.width, ash.height);

    /* Micro-silhouette read for screenshots — 1–3px accents, no extra UI. */
    if (!dmgFlash && !invulnBlink) {
      if (ash.fusionPureSenseMs > 0) {
        const pt = Math.min(1, ash.fusionPureSenseMs / PERCEPTION_MS);
        ctx.globalAlpha = 0.14 + pt * 0.12;
        ctx.fillStyle = "rgba(210, 230, 255, 0.85)";
        ctx.fillRect(ash.x + 3, ash.y + ash.height * 0.18, ash.width - 6, 2);
        ctx.globalAlpha = 0.1 + pt * 0.08;
        ctx.fillStyle = "rgba(190, 170, 255, 0.6)";
        ctx.fillRect(ash.x + 2, ash.y + ash.height - 5, ash.width - 4, 2);
        ctx.globalAlpha = 1;
      } else if (ash.perceptionRemainingMs > 0) {
        const rt = Math.min(1, ash.perceptionRemainingMs / PERCEPTION_READ_DURATION_MS);
        ctx.globalAlpha = 0.1 + rt * 0.1;
        ctx.fillStyle = "rgba(140, 230, 245, 0.75)";
        ctx.fillRect(ash.x + 3, ash.y + ash.height * 0.2, ash.width - 6, 2);
        ctx.globalAlpha = 0.08 + rt * 0.06;
        ctx.fillStyle = "rgba(100, 200, 220, 0.55)";
        ctx.fillRect(ash.x + 2, ash.y + ash.height - 5, ash.width - 4, 2);
        ctx.globalAlpha = 1;
      } else if (ash.fusionMoveMs > 0 && ash.fusionMoveChannel === 0) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#5c2820";
        ctx.fillRect(ash.x + 2, ash.y + 5, ash.width - 4, 3);
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#e8a090";
        ctx.fillRect(ash.x + 3, ash.y + ash.height - 4, ash.width - 6, 2);
        ctx.globalAlpha = 1;
      } else if (ash.fusionMoveMs > 0 && ash.fusionMoveChannel === 1) {
        ctx.strokeStyle = "rgba(120, 200, 255, 0.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ash.x + 3, ash.y + ash.height * 0.4);
        ctx.lineTo(ash.x + ash.width - 3, ash.y + ash.height * 0.4);
        ctx.stroke();
        ctx.fillStyle = "rgba(60, 100, 130, 0.35)";
        ctx.fillRect(ash.x + 1, ash.y + 1, 3, 4);
        ctx.fillRect(ash.x + ash.width - 4, ash.y + 1, 3, 4);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "#f2f6ff";
        ctx.fillRect(ash.x + 3, ash.y + 3, ash.width - 6, 5);
        ctx.fillStyle = "#d62828";
        ctx.fillRect(ash.x + 4, ash.y + ash.height - 6, ash.width - 8, 3);
        ctx.globalAlpha = 1;
      }
    }

    if (scratch.tensionLowHpMs > 0 && !dmgFlash) {
      const u = scratch.tensionLowHpMs / TENSION_LOWHP_MS;
      ctx.globalAlpha = 0.28 + u * 0.38;
      ctx.strokeStyle = "#e02828";
      ctx.lineWidth = 2;
      ctx.strokeRect(ash.x - 3, ash.y - 3, ash.width + 6, ash.height + 6);
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();

  drawAshPerceptionLayer(ctx, ash, cameraX, nowMs, senseStrength);
  drawUnstableAshPresentation(ctx, ash, cameraX, nowMs);

  drawSlashArc(ctx, ash, cameraX);

  if (ash.hitbox.active) {
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);
    ctx.fillStyle = "rgba(80, 220, 255, 0.12)";
    ctx.fillRect(ash.hitbox.x, ash.hitbox.y, ash.hitbox.w, ash.hitbox.h);
    ctx.restore();
  }
}

/** Screen-space only: brief edge cues for checkpoint heal and [E] read opening. */
function drawScreenEdgePulses(ctx: CanvasRenderingContext2D, scratch: RenderScratch): void {
  const cp = scratch.checkpointPulseMs;
  const rs = scratch.readSpaceOpenMs;
  const fu = scratch.unstableReadyPulseMs;
  if (cp <= 0 && rs <= 0 && fu <= 0) return;

  ctx.save();
  const w = VIEW_WIDTH;
  const h = VIEW_HEIGHT;

  if (fu > 0) {
    const u = fu / UNSTABLE_READY_PULSE_MS;
    const g = ctx.createLinearGradient(0, 0, w * 0.2, 0);
    g.addColorStop(0, `rgba(255, 200, 120, ${0.16 * u})`);
    g.addColorStop(0.65, `rgba(200, 140, 90, ${0.05 * u})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w * 0.2, h);
  }

  if (rs > 0) {
    const u = rs / READ_SPACE_OPEN_MS;
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.22);
    g.addColorStop(0, `rgba(120, 220, 245, ${0.12 * u})`);
    g.addColorStop(0.55, `rgba(80, 160, 200, ${0.04 * u})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h * 0.22);
  }

  if (cp > 0) {
    const u = cp / CHECKPOINT_PULSE_MS;
    const g = ctx.createLinearGradient(0, h, 0, h * 0.78);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.45, `rgba(60, 200, 160, ${0.06 * u})`);
    g.addColorStop(1, `rgba(40, 160, 130, ${0.14 * u})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
  }

  ctx.restore();
}

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  scratch: RenderScratch,
  nowMs: number,
  frameDtMs: number,
  winHud?: { newRecord?: boolean } | null,
  hudOptions?: HudDrawOptions | null,
): void {
  advanceScratch(scratch, state, frameDtMs);

  const viewCam = updateSmoothedCamera(scratch, state.cameraX, frameDtMs);
  const viewState: GameState = { ...state, cameraX: viewCam };

  const escPhase = escapePressurePhase(state);
  ctx.fillStyle = clearColorForPressure(escPhase);
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawWorld(ctx, viewState, scratch, nowMs);
  drawScreenEdgePulses(ctx, scratch);
  drawGateSealSpike(ctx, scratch.tensionGateMs);
  drawEscapeFinaleTint(ctx, escPhase);
  drawHitStopScreenAccent(ctx, state.hitStopRemainingMs);
  drawHud(ctx, state, nowMs, winHud, hudOptions);
}
