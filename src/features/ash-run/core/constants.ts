/** Physics & combat tunables — gameplay-first, no meta progression. */

export const FIXED_DT_MS = 1000 / 60;

/* -------------------------------------------------------------------------- */
/* Movement — platformer feel                                                */
/* -------------------------------------------------------------------------- */
/* Gravity slightly higher than early slice: faster fall reads as “weight”
   without turning jumps into bricks. Pairs with stronger jump impulse. */
export const GRAVITY = 2380;
export const MAX_FALL_SPEED = 760;

/* Split accel: ground is deliberate (slower ramp = easier to place feet);
   air is weaker so hops commit a bit but A/D still steers clearly. */
export const MOVE_ACCEL_GROUND = 3000;
export const MOVE_ACCEL_AIR = 2350;
export const MOVE_MAX = 300;

/* Ground friction nudged up: less micro-slide on narrow step tops after
   landings; air unchanged. */
export const FRICTION_GROUND = 0.86;
export const FRICTION_AIR = 0.94;

/* Jump impulse up slightly — leaves the ground faster (snappier takeoff). */
export const JUMP_VELOCITY = -545;

/* Coyote + buffer +2 ms: small forgiveness for stepped climbs without
   widening the jump window into a second jump. */
export const COYOTE_MS = 126;
export const JUMP_BUFFER_MS = 140;

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
export const DASH_COOLDOWN_MS = 680;

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
export const UNSTABLE_COOLDOWN_MS = 3200;
export const UNSTABLE_FLASH_MS = 220;
export const BIO_BURST_VX = 420;
export const BIO_BURST_VY = -180;
export const MECHA_DASH_MS = 88;
export const PERCEPTION_MS = 480;
export const PERCEPTION_SCALE = 0.42;

export const ASH_WIDTH = 22;
export const ASH_HEIGHT = 36;
export const INVULN_AFTER_HIT_MS = 1200;
export const HAZARD_TICK_MS = 200;

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
