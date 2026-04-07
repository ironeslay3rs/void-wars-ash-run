/**
 * Basic combat — short slash, training dummy, hit feedback.
 * No skills, combos, or inventory. Wire into your player + render loop.
 */

/* -------------------------------------------------------------------------- */
/* Tunables                                                                   */
/* -------------------------------------------------------------------------- */

export const BASIC_COMBAT_TUNING = {
  attackCooldownMs: 240,
  /** Slash hitbox lifetime (ms). */
  slashActiveMs: 72,
  slashHitW: 40,
  slashHitH: 28,
  damage: 1,
  /** Horizontal knockback applied to dummy (px/s impulse, decayed each step). */
  knockbackVx: 240,
  knockbackVy: -95,
  knockbackDecay: 0.82,
  hitFlashMs: 220,
  /** Prevents the same slash frame from tagging repeatedly. */
  targetHurtIFrameMs: 400,
  damageNumberTtlMs: 620,
  /** Float speed for damage text (px/s, negative = up). */
  damageNumberDriftY: -38,
  /** Tiny recoil on the attacker when a hit connects (add to player vel). */
  playerRecoilVx: 55,
  playerRecoilVy: 0,
} as const;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SlashHitbox = {
  x: number;
  y: number;
  w: number;
  h: number;
  ttlMs: number;
};

export type TargetDummy = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  /** Visual / logic flash after being hurt. */
  hitFlashMs: number;
  hurtCooldownMs: number;
  /** Knockback velocity (decayed in step). */
  vx: number;
  vy: number;
};

export type DamageFloater = {
  id: number;
  x: number;
  y: number;
  value: number;
  ttlMs: number;
};

export type BasicCombatState = {
  attackCooldownMs: number;
  slash: SlashHitbox | null;
  dummies: TargetDummy[];
  damageNumbers: DamageFloater[];
  nextDamageNumberId: number;
};

export type PlayerCombatPose = {
  x: number;
  y: number;
  width: number;
  height: number;
  facing: 1 | -1;
};

export type BasicCombatInput = {
  attackPressed: boolean;
};

/** Apply to player velocity when any hit landed this step (impact). */
export type PlayerHitImpulse = {
  vx: number;
  vy: number;
};

export type BasicCombatStepResult = {
  state: BasicCombatState;
  /** Non-zero when at least one enemy was struck this frame. */
  playerImpulse: PlayerHitImpulse;
  /** True on frames where a new slash was started. */
  didSwing: boolean;
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

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createBasicCombatState(): BasicCombatState {
  return {
    attackCooldownMs: 0,
    slash: null,
    dummies: [],
    damageNumbers: [],
    nextDamageNumberId: 1,
  };
}

export function createTargetDummy(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  maxHp: number,
): TargetDummy {
  return {
    id,
    x,
    y,
    w,
    h,
    hp: maxHp,
    maxHp,
    hitFlashMs: 0,
    hurtCooldownMs: 0,
    vx: 0,
    vy: 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Core step                                                                  */
/* -------------------------------------------------------------------------- */

function spawnSlash(player: PlayerCombatPose, t: typeof BASIC_COMBAT_TUNING): SlashHitbox {
  const hx =
    player.facing === 1
      ? player.x + player.width
      : player.x - t.slashHitW;
  const hy = player.y + player.height * 0.32;
  return {
    x: hx,
    y: hy,
    w: t.slashHitW,
    h: t.slashHitH,
    ttlMs: t.slashActiveMs,
  };
}

/**
 * One fixed timestep: cooldowns, slash lifetime, overlaps, knockback drift,
 * damage floaters. Pass your player pose each frame.
 */
export function stepBasicCombat(
  state: BasicCombatState,
  player: PlayerCombatPose,
  input: BasicCombatInput,
  dtMs: number,
): BasicCombatStepResult {
  const t = BASIC_COMBAT_TUNING;
  let attackCooldownMs = Math.max(0, state.attackCooldownMs - dtMs);
  let slash = state.slash ? { ...state.slash } : null;
  let dummies = state.dummies.map((d) => ({ ...d }));
  let damageNumbers = state.damageNumbers.map((n) => ({ ...n }));
  let nextId = state.nextDamageNumberId;
  let playerImpulse: PlayerHitImpulse = { vx: 0, vy: 0 };
  let didSwing = false;
  let hitsThisFrame = 0;

  /* Decay slash */
  if (slash) {
    slash.ttlMs -= dtMs;
    if (slash.ttlMs <= 0) slash = null;
  }

  /* New attack */
  if (input.attackPressed && attackCooldownMs <= 0 && !slash) {
    attackCooldownMs = t.attackCooldownMs;
    slash = spawnSlash(player, t);
    didSwing = true;
  }

  /* Timers on floaters */
  damageNumbers = damageNumbers
    .map((n) => ({
      ...n,
      ttlMs: n.ttlMs - dtMs,
      y: n.y + (t.damageNumberDriftY * dtMs) / 1000,
    }))
    .filter((n) => n.ttlMs > 0);

  /* Dummy hurt cooldown + hit flash + knockback integration */
  dummies = dummies.map((d) => {
    let hurtCooldownMs = Math.max(0, d.hurtCooldownMs - dtMs);
    let hitFlashMs = Math.max(0, d.hitFlashMs - dtMs);
    let { x, y, vx, vy } = d;
    const hp = d.hp;
    x += (vx * dtMs) / 1000;
    y += (vy * dtMs) / 1000;
    vx *= t.knockbackDecay;
    vy *= t.knockbackDecay;
    if (Math.abs(vx) < 4) vx = 0;
    if (Math.abs(vy) < 4) vy = 0;

    /* Hit test while slash active */
    if (
      slash &&
      hp > 0 &&
      hurtCooldownMs <= 0 &&
      rectsOverlap(slash, { x, y, w: d.w, h: d.h })
    ) {
      const newHp = Math.max(0, hp - t.damage);
      const pcx = player.x + player.width / 2;
      const ecx = x + d.w / 2;
      const away = ecx >= pcx ? 1 : -1;
      vx += away * t.knockbackVx;
      vy += t.knockbackVy;
      hurtCooldownMs = t.targetHurtIFrameMs;
      hitFlashMs = t.hitFlashMs;
      hitsThisFrame += 1;

      damageNumbers.push({
        id: nextId++,
        x: ecx,
        y: y - 6,
        value: t.damage,
        ttlMs: t.damageNumberTtlMs,
      });

      return {
        ...d,
        x,
        y,
        hp: newHp,
        vx,
        vy,
        hurtCooldownMs,
        hitFlashMs,
      };
    }

    return { ...d, x, y, vx, vy, hurtCooldownMs, hitFlashMs };
  });

  if (hitsThisFrame > 0) {
    playerImpulse = {
      vx: -player.facing * t.playerRecoilVx * Math.min(1, hitsThisFrame),
      vy: t.playerRecoilVy,
    };
  }

  return {
    state: {
      attackCooldownMs,
      slash,
      dummies,
      damageNumbers,
      nextDamageNumberId: nextId,
    },
    playerImpulse,
    didSwing,
  };
}

/** Whether the dummy should draw a bright hit flash this frame. */
export function dummyHitFlashAlpha(dummy: TargetDummy, tuning = BASIC_COMBAT_TUNING): number {
  if (dummy.hitFlashMs <= 0) return 0;
  return clamp(dummy.hitFlashMs / tuning.hitFlashMs, 0, 1);
}

/** Convenience: is slash active (for draw). */
export function isSlashActive(state: BasicCombatState): boolean {
  return state.slash !== null && state.slash.ttlMs > 0;
}
