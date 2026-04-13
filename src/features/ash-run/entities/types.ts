/** Ash + combat primitives — fixed protagonist, no alternate runners. */

export type Hitbox = {
  active: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  damage: number;
  /** Ms remaining. */
  ttl: number;
  hurtsEnemies: boolean;
};

/** 0 bio burst, 1 mecha dash burst, 2 pure perception slow */
export type UnstableChannel = 0 | 1 | 2;

export type Ash = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  coyoteMs: number;
  jumpBufferMs: number;
  hp: number;
  maxHp: number;
  invulnMs: number;
  attackCooldownMs: number;
  hitbox: Hitbox;
  dashCooldownMs: number;
  dashRemainingMs: number;
  respawnX: number;
  respawnY: number;
  unstableCooldownMs: number;
  unstableFlashMs: number;
  /** Last channel used this activation (flash / VFX). */
  unstableChannel: UnstableChannel | null;
  /** Next fusion in the Bio → Mecha → Pure loop — same value shown on HUD. */
  unstableNextChannel: UnstableChannel;
  /** Bio/Mecha: temporary movement style after unstable (Pure uses route-sense only). */
  fusionMoveMs: number;
  fusionMoveChannel: UnstableChannel | null;
  /** Pure unstable [K]: slow-mo route-sense window (PERCEPTION_SCALE). */
  fusionPureSenseMs: number;
  /** Active [E] “read space” — information only; real-time sim, no slow-mo. */
  perceptionRemainingMs: number;
  perceptionCooldownRemainingMs: number;
  /** True while `perceptionRemainingMs > 0` (set each step in step-game). */
  perceptionActive: boolean;
  /** -1 left wall, 1 right wall, 0 airborne/no wall contact. */
  wallContactSide: -1 | 0 | 1;
  /** True while wall-slide fall cap is applied this step. */
  wallSlideActive: boolean;
  /** Ms remaining that re-stick to the same wall is suppressed after a wall jump. */
  wallJumpLockoutMs: number;
  width: number;
  height: number;
};

export type PatrolEnemy = {
  kind: "patrol";
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  patrolLeft: number;
  patrolRight: number;
  hp: number;
  damage: number;
  isMiniboss: boolean;
  hurtCooldownMs: number;
};
