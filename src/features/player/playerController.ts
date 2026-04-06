/**
 * Ash — player motion controller (2D platformer).
 * No combat, abilities, or UI — movement only. Integrate with your collision pass.
 */

/* -------------------------------------------------------------------------- */
/* Tunables — adjust here until the loop feels right                            */
/* -------------------------------------------------------------------------- */

export const PLAYER_TUNING = {
  gravity: 2480,
  maxFallSpeed: 780,
  moveAccelGround: 3200,
  moveAccelAir: 2480,
  moveSpeedMax: 290,
  frictionGround: 0.87,
  frictionAir: 0.93,
  /** Initial jump impulse (px/s upward). */
  jumpVelocity: -535,
  /**
   * While ascending, if jump is released, vertical speed is scaled by this
   * (short hop). Tuned so tap = low, hold = full.
   */
  jumpCutMultiplier: 0.42,
  /**
   * Extra gravity scale applied while holding jump during ascent — extends
   * hang slightly for a readable apex without floatiness.
   */
  jumpHoldGravityScale: 0.78,
  coyoteMs: 118,
  jumpBufferMs: 132,
  /** Snap small horizontal speed to zero (reduces jitter). */
  vxEpsilon: 7,
} as const;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PlayerMotionState = "idle" | "run" | "jump" | "fall";

export type PlayerInput = {
  left: boolean;
  right: boolean;
  /** True on the frame jump was pressed (edge). */
  jumpPressed: boolean;
  /** True while jump key is held. */
  jumpHeld: boolean;
};

/**
 * What your physics/collision layer must provide each tick after resolving
 * position (ground / walls are your responsibility).
 */
export type PlayerEnvironment = {
  grounded: boolean;
};

export type PlayerController = {
  vx: number;
  vy: number;
  facing: 1 | -1;
  motion: PlayerMotionState;
  coyoteMs: number;
  jumpBufferMs: number;
  /** For one-shot short-hop on jump release (not applied every air frame). */
  jumpHeldPrev: boolean;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function deriveMotion(
  grounded: boolean,
  vy: number,
  vx: number,
): PlayerMotionState {
  if (grounded) {
    const runThreshold = 48;
    return Math.abs(vx) >= runThreshold ? "run" : "idle";
  }
  return vy < 0 ? "jump" : "fall";
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

export function createPlayerController(): PlayerController {
  return {
    vx: 0,
    vy: 0,
    facing: 1,
    motion: "idle",
    coyoteMs: 0,
    jumpBufferMs: 0,
    jumpHeldPrev: false,
  };
}

/**
 * Single fixed step. Pass the same `dtMs` as your game loop (e.g. 1000/60).
 * Apply your own X/Y integration + collision after this, then set `grounded`
 * from the result for the next call.
 */
export function stepPlayerController(
  p: PlayerController,
  input: PlayerInput,
  env: PlayerEnvironment,
  dtMs: number,
): PlayerController {
  const t = PLAYER_TUNING;
  const dt = dtMs * 0.001;

  let vx = p.vx;
  let vy = p.vy;
  let facing = p.facing;
  let coyoteMs = p.coyoteMs;
  let jumpBufferMs = p.jumpBufferMs;
  let jumpHeldPrev = p.jumpHeldPrev;

  /* Coyote time: last moment of ground grace. */
  if (env.grounded) {
    coyoteMs = t.coyoteMs;
  } else {
    coyoteMs = Math.max(0, coyoteMs - dtMs);
  }

  /* Jump buffer: press slightly before landing still commits. */
  if (input.jumpPressed) {
    jumpBufferMs = t.jumpBufferMs;
  } else {
    jumpBufferMs = Math.max(0, jumpBufferMs - dtMs);
  }

  /* Horizontal intent */
  let move = 0;
  if (input.left) move -= 1;
  if (input.right) move += 1;
  if (move !== 0) {
    facing = (move > 0 ? 1 : -1) as 1 | -1;
  }

  const accel = env.grounded ? t.moveAccelGround : t.moveAccelAir;
  if (move !== 0) {
    vx += move * accel * dt;
    vx = clamp(vx, -t.moveSpeedMax, t.moveSpeedMax);
  } else {
    const fr = env.grounded ? t.frictionGround : t.frictionAir;
    vx *= fr;
    if (Math.abs(vx) < t.vxEpsilon) vx = 0;
  }

  /* Jump: buffer + coyote — responsive, low perceived delay. */
  const canJump = env.grounded || coyoteMs > 0;
  if (jumpBufferMs > 0 && canJump) {
    vy = t.jumpVelocity;
    jumpBufferMs = 0;
    coyoteMs = 0;
  }

  /* Gravity — variable height: softer pull while holding during ascent. */
  let g = t.gravity;
  if (vy < 0 && input.jumpHeld) {
    g *= t.jumpHoldGravityScale;
  }
  vy = Math.min(t.maxFallSpeed, vy + g * dt);

  /* Jump cut: one frame when key goes up during ascent (short hop). */
  const releasedJump = jumpHeldPrev && !input.jumpHeld;
  if (releasedJump && vy < 0) {
    vy *= t.jumpCutMultiplier;
  }
  jumpHeldPrev = input.jumpHeld;

  const motion = deriveMotion(env.grounded, vy, vx);

  return {
    vx,
    vy,
    facing,
    motion,
    coyoteMs,
    jumpBufferMs,
    jumpHeldPrev,
  };
}

/**
 * Optional: integrate position from velocities (no collision). Your game
 * should normally resolve X/Y against solid tiles after this.
 */
export function integratePosition(
  x: number,
  y: number,
  p: PlayerController,
  dtMs: number,
): { x: number; y: number } {
  const dt = dtMs * 0.001;
  return {
    x: x + p.vx * dt,
    y: y + p.vy * dt,
  };
}
