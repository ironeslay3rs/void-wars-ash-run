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
  unstableChannel: UnstableChannel | null;
  perceptionRemainingMs: number;
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
