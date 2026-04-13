/** Physics & combat tunables — gameplay-first, no meta progression. */

export const FIXED_DT_MS = 1000 / 60;

/* -------------------------------------------------------------------------- */
/* Movement — platformer feel                                                */
/* -------------------------------------------------------------------------- */
/* Gravity slightly higher than early slice: faster fall reads as “weight”
   without turning jumps into bricks. Pairs with stronger jump impulse. */
export const GRAVITY = 2380;
export const MAX_FALL_SPEED = 760;

/* Slightly stronger horizontal snap for a more confident run: Ash reaches pace
   sooner on ground and keeps enough air steering to stay readable. */
export const MOVE_ACCEL_GROUND = 3360;
export const MOVE_ACCEL_AIR = 2480;
export const MOVE_MAX = 318;

/* Firmer stop on ground, tiny bit more carry in air: closer to a classic
   action-platformer run without pushing authored jumps off-spec. */
export const FRICTION_GROUND = 0.82;
export const FRICTION_AIR = 0.95;

/* Jump impulse up slightly — leaves the ground faster (snappier takeoff). */
export const JUMP_VELOCITY = -545;

/* Coyote + buffer +2 ms: small forgiveness for stepped climbs without
   widening the jump window into a second jump. */
/* +6 ms: thin lab nails and lips forgive a hair more — still committed jumps. */
export const COYOTE_MS = 132;
export const JUMP_BUFFER_MS = 145;

/* After a real fall onto ground, horizontal speed is scaled once so lips and
   small platforms don’t feel like ice. See step-game (vy threshold). */
export const LANDING_VX_DAMP = 0.9;
export const LANDING_VY_THRESHOLD = 130;

/* -------------------------------------------------------------------------- */
/* Dash — committed burst                                                     */
/* -------------------------------------------------------------------------- */
/* Shorter window + higher speed: reads as a punch of velocity, not a long
   slide. Vertical kill on start makes the burst feel “locked in”. */
export const DASH_SPEED = 755;
export const DASH_MS = 105;
export const DASH_COOLDOWN_MS = 640;

/* When dash (or mecha dash) expires mid–fixed-step, horizontal carry is cut
   so the burst doesn’t read as a long post-dash slide. */
export const DASH_END_VX_MULT = 0.34;

/* -------------------------------------------------------------------------- */
/* Melee attack — snappy cadence                                                */
/* -------------------------------------------------------------------------- */
/* Cooldown +13 ms vs prior pass: still snappy, slightly less mash-friendly. */
export const ATTACK_COOLDOWN_MS = 238;
export const ATTACK_HIT_W = 36;
export const ATTACK_HIT_H = 28;
export const ATTACK_DAMAGE = 1;
export const ATTACK_ACTIVE_MS = 72;

/* -------------------------------------------------------------------------- */
/* Unstable fusion (unchanged roles; timings follow dash/attack above)         */
/* -------------------------------------------------------------------------- */
/** Ash-only: fusion commit needs prior motion (see step-game fusionMotionReady). */
export const UNSTABLE_MOTION_VX_MIN = 52;
/** Cooldown ticks down faster while Ash is moving — rewards staying in flow. */
export const UNSTABLE_COOLDOWN_RECHARGE_MUL = 1.16;
export const UNSTABLE_COOLDOWN_MS = 3000;
export const UNSTABLE_FLASH_MS = 220;
export const BIO_BURST_VX = 420;
export const BIO_BURST_VY = -180;
export const MECHA_DASH_MS = 88;
/* Resonance Sight (Pure school) — canon-locked in
   `lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md`.
   Two modes share one faculty: [E] Read (manual burst) and [K] Pure
   fusion route-sense (motion-gated slow-mo). No mana cost, cooldown
   only — deliberate deviation documented in the canon doc. */
/** Fusion Pure [K]: slow-mo route-sense duration (uses PERCEPTION_SCALE in step-game). */
export const PERCEPTION_MS = 480;
export const PERCEPTION_SCALE = 0.42;
/** [E] Resonance Sight: reading-window length; cooldown'd burst, not a toggle. */
export const PERCEPTION_READ_DURATION_MS = 2600;
/** [E] Resonance Sight: full cooldown after the reading window closes. */
export const PERCEPTION_READ_COOLDOWN_MS = 7800;
/** Fusion as movement layer: Bio / Mecha windows after [K] (Pure uses perception time). */
export const FUSION_BIO_MOVE_MS = 540;
export const FUSION_MECHA_MOVE_MS = 460;

/* -------------------------------------------------------------------------- */
/* Wall slide / wall jump / variable jump                                     */
/* -------------------------------------------------------------------------- */
/* Bio+Mecha heritage: Ash can hug walls briefly and kick off. Pure fusion
   widens the re-grab forgiveness (see step-game fusionMoveStyle). */
/** Fall speed cap while wall-sliding — visibly slower than free fall. */
export const WALL_SLIDE_FALL_CAP = 220;
/** Horizontal pop off the wall on a wall jump (opposite side of contact). */
export const WALL_JUMP_POP_SPEED = 300;
/** Ms after a wall jump during which re-sticking to the same wall is suppressed. */
export const WALL_JUMP_LOCKOUT_MS = 180;
/** Horizontal probe distance used when detecting a wall the body is pressed into. */
export const WALL_CONTACT_PROBE_PX = 1.2;
/** Variable jump trim: on jump release while vy<0, vy := max(vy, JUMP_VELOCITY * this). */
export const VARIABLE_JUMP_RELEASE_FACTOR = 0.45;
/** Wall jump vertical impulse = JUMP_VELOCITY * this (slightly softer than a full floor jump). */
export const WALL_JUMP_VY_FACTOR = 0.95;
/** Pure fusion widens wall-slide re-grab forgiveness (lockout shortened by this factor). */
export const PURE_WALL_LOCKOUT_FORGIVENESS = 0.7;

export const ASH_WIDTH = 22;
export const ASH_HEIGHT = 36;
export const INVULN_AFTER_HIT_MS = 1200;
/** Slice-tuned: slightly slower hazard ticks than 200ms so acid reads fair on 3 HP. */
export const HAZARD_TICK_MS = 215;

/* -------------------------------------------------------------------------- */
/* Enemy body contact — knockback only (no new systems)                        */
/* -------------------------------------------------------------------------- */
/* Push away from enemy centroid so direction matches what the eye expects;
   slightly stronger vertical pop reads as a clear hit reaction. */
export const ENEMY_CONTACT_KNOCKBACK_VX = 255;
export const ENEMY_CONTACT_KNOCKBACK_VY = -200;

/* -------------------------------------------------------------------------- */
/* Hit-stop — combat punch (fixed-step safe)                                   */
/* -------------------------------------------------------------------------- */
/* ~2.4 frames at 60Hz: one brief sim freeze when a damaging hit connects.
   Not stacked per target in a single step (see step-game max()).            */
export const HIT_STOP_MS = 40;

export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

/** Camera bias toward travel direction — frames the next read without a minimap. */
export const CAMERA_LOOKAHEAD_PX = 54;

/** Render-only follow: exponential smoothing toward sim `cameraX` (ms time constant). */
export const CAMERA_SMOOTH_TAU_MS = 92;
/** Snap instead of easing when the sim camera jumps (respawn, large correction). */
export const CAMERA_SMOOTH_SNAP_PX = 300;
