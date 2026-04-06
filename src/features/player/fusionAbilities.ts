/**
 * Fusion abilities — first slice: Bio Pulse only.
 * Short forward burst, hurts targets in path, recoil + shake + glow hooks for render.
 */

/* -------------------------------------------------------------------------- */
/* Tunables                                                                   */
/* -------------------------------------------------------------------------- */

export const BIO_PULSE_TUNING = {
  cooldownMs: 2600,
  dashMs: 118,
  dashSpeed: 695,
  damage: 2,
  /** Strike volume in front of Ash (world px). */
  hitboxW: 52,
  hitboxH: 32,
  hitboxAnchorY: 0.34,
  /** Backward kick when the burst ends. */
  recoilVx: 185,
  screenShakeMs: 165,
  /** Max camera nudge in px (render multiplies by remaining shake ratio). */
  screenShakeMagnitude: 4.2,
} as const;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type BioPulseInput = {
  bioPulsePressed: boolean;
};

export type BioPulsePlayer = {
  x: number;
  y: number;
  width: number;
  height: number;
  facing: 1 | -1;
};

/** Anything you can hurt with the pulse (id + rect + hp). */
export type PulseTarget = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
};

export type BioPulseState = {
  cooldownMs: number;
  dashRemainingMs: number;
  screenShakeMs: number;
  /** Tracks who was already tagged this dash (one proc per target per cast). */
  damagedThisDash: Record<string, true>;
};

export type BioPulseStepResult = {
  state: BioPulseState;
  /** World-space motion from the burst this frame (apply to player x/y). */
  playerDelta: { dx: number; dy: number };
  /** While dashing, lock horizontal speed to this; null = leave player physics. */
  overrideVelocity: { vx: number; vy: number } | null;
  /** Fired once when the dash window closes — add to player velocity. */
  recoilImpulse: { vx: number; vy: number } | null;
  hits: Array<{ targetId: string; damage: number }>;
  /** 0–1 for glow pass (burst active). */
  glowStrength: number;
  /** True the frame the pulse begins (shake / VFX spike). */
  pulseStarted: boolean;
};

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

type Rect = { x: number; y: number; w: number; h: number };

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function pulseHitbox(player: BioPulsePlayer, t: typeof BIO_PULSE_TUNING): Rect {
  const hy = player.y + player.height * t.hitboxAnchorY;
  const x =
    player.facing === 1
      ? player.x + player.width - 6
      : player.x - t.hitboxW + 6;
  return { x, y: hy, w: t.hitboxW, h: t.hitboxH };
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

export function createBioPulseState(): BioPulseState {
  return {
    cooldownMs: 0,
    dashRemainingMs: 0,
    screenShakeMs: 0,
    damagedThisDash: {},
  };
}

/**
 * Fixed step. Apply `playerDelta` after your collision; merge `hits` into target HP
 * in your sim; add `recoilImpulse` once when non-null; while dashing, prefer
 * `overrideVelocity` for horizontal control lock.
 */
export function stepBioPulse(
  state: BioPulseState,
  player: BioPulsePlayer,
  targets: readonly PulseTarget[],
  input: BioPulseInput,
  dtMs: number,
): BioPulseStepResult {
  const tun = BIO_PULSE_TUNING;
  let cooldownMs = Math.max(0, state.cooldownMs - dtMs);
  let screenShakeMs = Math.max(0, state.screenShakeMs - dtMs);
  let damagedThisDash = { ...state.damagedThisDash };

  const prevDashMs = state.dashRemainingMs;
  const dashAfterDecay = Math.max(0, prevDashMs - dtMs);

  const canStart =
    input.bioPulsePressed &&
    cooldownMs <= 0 &&
    dashAfterDecay <= 0;

  let pulseStarted = false;
  let dashRemainingMs = dashAfterDecay;

  if (canStart) {
    pulseStarted = true;
    dashRemainingMs = tun.dashMs;
    cooldownMs = tun.cooldownMs;
    screenShakeMs = tun.screenShakeMs;
    damagedThisDash = {};
  }

  const isDashing = dashRemainingMs > 0;

  let playerDelta = { dx: 0, dy: 0 };
  let overrideVelocity: { vx: number; vy: number } | null = null;
  let recoilImpulse: { vx: number; vy: number } | null = null;
  const hits: Array<{ targetId: string; damage: number }> = [];

  if (isDashing) {
    const sp = tun.dashSpeed * player.facing;
    overrideVelocity = { vx: sp, vy: 0 };
    playerDelta = {
      dx: (sp * dtMs) / 1000,
      dy: 0,
    };

    const hb = pulseHitbox(player, tun);
    for (const e of targets) {
      if (e.hp <= 0) continue;
      if (damagedThisDash[e.id]) continue;
      if (
        rectsOverlap(hb, { x: e.x, y: e.y, w: e.w, h: e.h })
      ) {
        damagedThisDash[e.id] = true;
        hits.push({ targetId: e.id, damage: tun.damage });
      }
    }
  }

  /* Recoil only when the burst actually ends this frame (no same-frame restart). */
  const dashEnded =
    prevDashMs > 0 && dashAfterDecay <= 0 && !pulseStarted;
  if (dashEnded) {
    recoilImpulse = {
      vx: -player.facing * tun.recoilVx,
      vy: 0,
    };
  }

  const glowStrength = isDashing
    ? Math.min(1, dashRemainingMs / tun.dashMs) * 0.92 + 0.08
    : 0;

  return {
    state: {
      cooldownMs,
      dashRemainingMs,
      screenShakeMs,
      damagedThisDash,
    },
    playerDelta,
    overrideVelocity,
    recoilImpulse,
    hits,
    glowStrength,
    pulseStarted,
  };
}

/** Deterministic shake for canvas / camera (no extra RNG state). */
export function bioPulseScreenShakeOffset(
  state: BioPulseState,
  nowMs: number,
  tuning = BIO_PULSE_TUNING,
): { ox: number; oy: number } {
  if (state.screenShakeMs <= 0) return { ox: 0, oy: 0 };
  const u = state.screenShakeMs / tuning.screenShakeMs;
  const mag = tuning.screenShakeMagnitude * u;
  return {
    ox: Math.sin(nowMs * 0.091) * mag,
    oy: Math.cos(nowMs * 0.073) * mag * 0.55,
  };
}

export function isBioPulseDashing(state: BioPulseState): boolean {
  return state.dashRemainingMs > 0;
}
