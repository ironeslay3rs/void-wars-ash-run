import { createMinibossForLevel } from "../level/miniboss-registry";
import type { Ash, UnstableChannel } from "../entities/types";
import { findExit, isBossGate, isCheckpoint, isHazard, solidsOf } from "../level/queries";
import type { Rect } from "../level/types";
import {
  ashBounds,
  clamp,
  detectWallSide,
  rectsOverlap,
  resolveX,
  resolveY,
} from "./collision";
import {
  ATTACK_ACTIVE_MS,
  ATTACK_COOLDOWN_MS,
  ATTACK_DAMAGE,
  ATTACK_HIT_H,
  ATTACK_HIT_W,
  BIO_BURST_VX,
  BIO_BURST_VY,
  COYOTE_MS,
  DASH_COOLDOWN_MS,
  DASH_END_VX_MULT,
  DASH_MS,
  DASH_SPEED,
  ENEMY_CONTACT_KNOCKBACK_VX,
  ENEMY_CONTACT_KNOCKBACK_VY,
  FRICTION_AIR,
  FRICTION_GROUND,
  FUSION_BIO_MOVE_MS,
  FUSION_MECHA_MOVE_MS,
  GRAVITY,
  HAZARD_TICK_MS,
  HIT_STOP_MS,
  CAMERA_LOOKAHEAD_PX,
  INVULN_AFTER_HIT_MS,
  JUMP_BUFFER_MS,
  JUMP_VELOCITY,
  LANDING_VX_DAMP,
  LANDING_VY_THRESHOLD,
  MAX_FALL_SPEED,
  MECHA_DASH_MS,
  MOVE_ACCEL_AIR,
  MOVE_ACCEL_GROUND,
  MOVE_MAX,
  PERCEPTION_MS,
  PERCEPTION_SCALE,
  PERCEPTION_READ_COOLDOWN_MS,
  PERCEPTION_READ_DURATION_MS,
  UNSTABLE_COOLDOWN_MS,
  UNSTABLE_COOLDOWN_RECHARGE_MUL,
  UNSTABLE_FLASH_MS,
  UNSTABLE_MOTION_VX_MIN,
  VARIABLE_JUMP_RELEASE_FACTOR,
  VIEW_WIDTH,
  WALL_CONTACT_PROBE_PX,
  WALL_JUMP_LOCKOUT_MS,
  WALL_JUMP_POP_SPEED,
  WALL_JUMP_VY_FACTOR,
  WALL_SLIDE_FALL_CAP,
  PURE_WALL_LOCKOUT_FORGIVENESS,
} from "./constants";
import { updateTimeShadows } from "../perception/timeShadowSystem";
import { advanceRhythm } from "./rhythm";
import {
  bonusForGrade,
  DEFAULT_GRADING_FRAMES,
  gradeAction,
} from "./rhythm-grading";
import type { GameState, InputBits } from "./types";

function modChannel(n: number): UnstableChannel {
  return ((((n % 3) + 3) % 3) as UnstableChannel);
}

/**
 * Fusion queue: Bio → Mecha → Pure → … HUD `unstableNextChannel` is exactly what
 * [K] fires — no mid-fight input branching (readability over cleverness).
 */

/**
 * Unstable fusion identity: the grafted spine only “catches” when Ash is already
 * moving — air, dash, or meaningful horizontal speed. Standing still on the lab
 * floor does nothing (no cooldown spent), so escape stays kinetic, not idle.
 */
function fusionMotionReady(ash: Ash): boolean {
  return (
    !ash.grounded ||
    Math.abs(ash.vx) >= UNSTABLE_MOTION_VX_MIN ||
    ash.dashRemainingMs > 0
  );
}

/** Which fusion movement style applies — Pure wins whenever fusion route-sense is active. */
function fusionMoveStyle(ash: Ash): "bio" | "mecha" | "pure" | null {
  if (ash.fusionPureSenseMs > 0) return "pure";
  if (ash.fusionMoveMs <= 0 || ash.fusionMoveChannel === null) return null;
  if (ash.fusionMoveChannel === 0) return "bio";
  if (ash.fusionMoveChannel === 1) return "mecha";
  return null;
}

/**
 * One fixed timestep. Deterministic: same state + input + dt → same next state.
 * Hit-stop burns whole steps without integrating physics so M1 / 60Hz stay aligned.
 */
export function stepGame(state: GameState, input: InputBits, dtMs: number): GameState {
  if (state.phase === "won") {
    const s = { ...state };
    if (s.beat) {
      const ttl = s.beat.ttlMs - dtMs;
      s.beat = ttl <= 0 ? null : { ...s.beat, ttlMs: ttl };
    }
    return s;
  }

  if (state.phase !== "playing") return state;

  const s = { ...state };

  /* Hit-stop: freeze world & input consumption for a few ms after a landed hit.
     No partial physics in the same step — keeps the fixed-step loop simple. */
  if (s.hitStopRemainingMs > 0) {
    const next = Math.max(0, s.hitStopRemainingMs - dtMs);
    return { ...s, hitStopRemainingMs: next };
  }

  s.runElapsedMs = (s.runElapsedMs ?? 0) + dtMs;
  /* World heartbeat advances with sim time (not wall clock) — deterministic
     and unaffected by hit-stop. Per-action grades are computed below. */
  s.rhythm = advanceRhythm(s.rhythm, s.runElapsedMs);
  /* AR-2.2 input grading — Perfect/Good/OK/Off tiers drive bonuses. */
  const actionGrade = gradeAction(
    s.rhythm,
    s.runElapsedMs,
    DEFAULT_GRADING_FRAMES,
  );
  const actionBonus = bonusForGrade(actionGrade);

  const ash = { ...s.ash };
  const solids = solidsOf(s.level);
  const floor = solids.find((x) => x.x === 0 && x.w >= s.level.width - 100);
  const floorY = floor ? floor.y : 480;

  /* Snapshot before timers: used to detect dash ending this step (burst trim). */
  const dashMsAtStepStart = state.ash.dashRemainingMs;

  const timeMul = ash.fusionPureSenseMs > 0 ? PERCEPTION_SCALE : 1;
  const dt = dtMs * timeMul;

  if (ash.fusionPureSenseMs > 0) {
    ash.fusionPureSenseMs = Math.max(0, ash.fusionPureSenseMs - dtMs);
  }
  /* Resonance Sight — [E] Read mode. Cooldown'd burst (not toggle, not hold):
     one edge press opens the reading window; window closes on its own; cooldown
     begins on close. Real-time only — never scaled by PERCEPTION_SCALE, since
     canon says the [E] read is Pure faculty without time dilation. Spec:
     lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md */
  if (ash.perceptionRemainingMs > 0) {
    ash.perceptionRemainingMs = Math.max(0, ash.perceptionRemainingMs - dtMs);
    if (ash.perceptionRemainingMs <= 0) {
      ash.perceptionCooldownRemainingMs = PERCEPTION_READ_COOLDOWN_MS;
    }
  } else if (ash.perceptionCooldownRemainingMs > 0) {
    ash.perceptionCooldownRemainingMs = Math.max(
      0,
      ash.perceptionCooldownRemainingMs - dtMs,
    );
  }
  if (ash.fusionMoveMs > 0) {
    ash.fusionMoveMs = Math.max(0, ash.fusionMoveMs - dtMs);
    if (ash.fusionMoveMs <= 0) ash.fusionMoveChannel = null;
  }

  if (s.beat) {
    const ttl = s.beat.ttlMs - dtMs;
    s.beat = ttl <= 0 ? null : { ...s.beat, ttlMs: ttl };
  }

  if (ash.invulnMs > 0) ash.invulnMs = Math.max(0, ash.invulnMs - dtMs);
  if (ash.attackCooldownMs > 0) {
    ash.attackCooldownMs = Math.max(0, ash.attackCooldownMs - dtMs);
  }
  if (ash.dashCooldownMs > 0) {
    ash.dashCooldownMs = Math.max(0, ash.dashCooldownMs - dtMs);
  }
  if (ash.unstableCooldownMs > 0) {
    let cdDecay = dtMs;
    if (
      Math.abs(ash.vx) >= UNSTABLE_MOTION_VX_MIN ||
      !ash.grounded ||
      ash.dashRemainingMs > 0
    ) {
      cdDecay *= UNSTABLE_COOLDOWN_RECHARGE_MUL;
    }
    ash.unstableCooldownMs = Math.max(0, ash.unstableCooldownMs - cdDecay);
  }
  if (ash.unstableFlashMs > 0) {
    ash.unstableFlashMs = Math.max(0, ash.unstableFlashMs - dtMs);
  }
  if (ash.dashRemainingMs > 0) {
    ash.dashRemainingMs = Math.max(0, ash.dashRemainingMs - dtMs);
  }
  if (ash.wallJumpLockoutMs > 0) {
    ash.wallJumpLockoutMs = Math.max(0, ash.wallJumpLockoutMs - dtMs);
  }

  if (ash.hitbox.active) {
    ash.hitbox.ttl -= dtMs;
    if (ash.hitbox.ttl <= 0) {
      ash.hitbox = { ...ash.hitbox, active: false, ttl: 0 };
    }
  }

  {
    const cap = fusionMoveStyle(ash) === "pure" ? COYOTE_MS * 1.18 : COYOTE_MS;
    if (ash.grounded) ash.coyoteMs = cap;
    else ash.coyoteMs = Math.max(0, ash.coyoteMs - dt);
  }

  const fStyle = fusionMoveStyle(ash);
  const jbMax =
    fStyle === "pure" ? JUMP_BUFFER_MS * 1.12 : JUMP_BUFFER_MS;

  if (input.jumpPressed) ash.jumpBufferMs = jbMax;
  else ash.jumpBufferMs = Math.max(0, ash.jumpBufferMs - dt);

  if (
    input.perceptionPressed &&
    ash.perceptionRemainingMs <= 0 &&
    ash.perceptionCooldownRemainingMs <= 0
  ) {
    ash.perceptionRemainingMs = PERCEPTION_READ_DURATION_MS;
  }

  /* Resonance Sight tutorial: if Ash is approaching the acid wash around x≈850
     on Folio I and has never pressed [E], surface the canonical name once.
     Pressing [E] at any point silences it for the rest of the run (even
     before the trigger fires). Numbers cited are from the Pure - Resonance
     Sight canon doc (2.6s window / 7.8s cooldown). */
  if (input.perceptionPressed) s.perceptionEverUsed = true;
  if (
    !s.perceptionHintShown &&
    !s.perceptionEverUsed &&
    s.level.id === "blackcity_lab_containment" &&
    ash.x >= 850
  ) {
    s.perceptionHintShown = true;
    s.beat = {
      id: "perception_tutorial",
      text: "Resonance Sight — mother's gift. Press E.\nRead the acid before you run it. 2.6s read · 7.8s cooldown.",
      ttlMs: 3000,
    };
  } else if (
    s.perceptionEverUsed &&
    s.beat?.id === "perception_tutorial"
  ) {
    s.beat = null;
  }

  if (
    input.dashPressed &&
    ash.dashCooldownMs <= 0 &&
    ash.dashRemainingMs <= 0
  ) {
    ash.dashRemainingMs = DASH_MS;
    ash.dashCooldownMs = DASH_COOLDOWN_MS;
    /* Strong vertical dump: burst reads committed, not a floaty drift. */
    ash.vy *= 0.2;
    /* Rhythm grade → dash i-frames (AR-2.2). Off-beat grants zero — dash
       still works, just without the invuln. */
    if (actionBonus.dashIframeMs > 0) {
      ash.invulnMs = Math.max(ash.invulnMs, actionBonus.dashIframeMs);
    }
  }

  const dashing = ash.dashRemainingMs > 0;
  if (dashing) {
    let dSp = DASH_SPEED;
    if (fStyle === "mecha") dSp *= 1.045;
    ash.vx = ash.facing * dSp;
    ash.vy = 0;
  } else {
    let moveMax = MOVE_MAX;
    let ag = MOVE_ACCEL_GROUND;
    let aa = MOVE_ACCEL_AIR;
    let frG = FRICTION_GROUND;
    let frA = FRICTION_AIR;
    let grav = GRAVITY;
    let vCap = MAX_FALL_SPEED;
    if (fStyle === "bio") {
      moveMax *= 1.22;
      ag *= 1.16;
      aa *= 1.12;
      frG *= 0.9;
      frA *= 0.93;
    } else if (fStyle === "mecha") {
      moveMax *= 0.9;
      ag *= 1.36;
      aa *= 1.3;
      frG *= 1.07;
      frA *= 1.05;
    } else if (fStyle === "pure") {
      ag *= 0.94;
      aa *= 0.88;
      frA *= 1.045;
      frG *= 1.03;
      grav *= 0.86;
      vCap *= 0.88;
    }

    let target = 0;
    if (input.left) target -= 1;
    if (input.right) target += 1;
    if (target !== 0) ash.facing = (target > 0 ? 1 : -1) as 1 | -1;

    const accelRate = ash.grounded ? ag : aa;
    const accel = accelRate * dt * 0.001;
    if (target !== 0) {
      ash.vx += target * accel;
      ash.vx = clamp(ash.vx, -moveMax, moveMax);
    } else {
      const f = ash.grounded ? frG : frA;
      ash.vx *= f;
      if (Math.abs(ash.vx) < 8) ash.vx = 0;
    }

    /* Wall contact detection — airborne only; suppressed briefly after wall jump
       so a kick-off doesn't immediately re-stick. Pure fusion shortens that lockout. */
    let wallSide: -1 | 0 | 1 = 0;
    if (!ash.grounded) {
      const effectiveLockout =
        fStyle === "pure"
          ? ash.wallJumpLockoutMs * PURE_WALL_LOCKOUT_FORGIVENESS
          : ash.wallJumpLockoutMs;
      if (effectiveLockout <= 0) {
        wallSide = detectWallSide(ash, solids, WALL_CONTACT_PROBE_PX);
      }
    }
    ash.wallContactSide = wallSide;

    /* Wall slide: airborne + horizontal input into the wall + falling. */
    const pressingIntoWall =
      (wallSide === 1 && input.right) || (wallSide === -1 && input.left);
    const wallSliding = !ash.grounded && pressingIntoWall && ash.vy > 0;
    ash.wallSlideActive = wallSliding;

    ash.vy = Math.min(vCap, ash.vy + (grav * dt) / 1000);
    if (wallSliding && ash.vy > WALL_SLIDE_FALL_CAP) {
      ash.vy = WALL_SLIDE_FALL_CAP;
    }

    if (ash.jumpBufferMs > 0 && ash.coyoteMs > 0) {
      /* Rhythm grade scales jump height: Perfect=1.5, Good=1.25, OK=1.1,
         Off=1.0 (baseline). vy is negative, so multiplier makes jump higher. */
      ash.vy = JUMP_VELOCITY * actionBonus.jumpVyMult;
      ash.jumpBufferMs = 0;
      ash.coyoteMs = 0;
      ash.grounded = false;
    } else if (ash.jumpBufferMs > 0 && wallSide !== 0 && !ash.grounded) {
      /* Wall jump: kick opposite the contact side. Soft vy relative to floor jump.
         Lockout prevents immediate re-grab of the same wall. */
      const wallJumpVy = JUMP_VELOCITY * WALL_JUMP_VY_FACTOR;
      ash.vy = wallJumpVy * actionBonus.jumpVyMult;
      ash.vx = -wallSide * WALL_JUMP_POP_SPEED;
      ash.facing = (-wallSide > 0 ? 1 : -1) as 1 | -1;
      ash.jumpBufferMs = 0;
      ash.wallJumpLockoutMs = WALL_JUMP_LOCKOUT_MS;
      ash.wallContactSide = 0;
      ash.wallSlideActive = false;
    }

    /* Variable jump height: releasing jump while still rising trims the arc.
       Classic short-hop / full-hop split. */
    if (!input.jump && ash.vy < 0 && !ash.grounded) {
      const trimmed = JUMP_VELOCITY * VARIABLE_JUMP_RELEASE_FACTOR;
      if (ash.vy < trimmed) ash.vy = trimmed;
    }
  }

  const vyBeforeMove = ash.vy;

  const dx = (ash.vx * dt) / 1000;
  ash.x = resolveX(ash, solids, dx);
  ash.x = clamp(ash.x, 0, s.level.width - ash.width);

  const dy = (ash.vy * dt) / 1000;
  const ry = resolveY(ash, solids, dy);
  ash.y = ry.y;
  ash.grounded = ry.grounded;
  if (ash.grounded && ash.vy > 0) ash.vy = 0;
  if (ash.grounded) {
    ash.wallContactSide = 0;
    ash.wallSlideActive = false;
  }

  /* Landing from a real fall: trim horizontal carry so stepped geometry and
     platform lips read as stable landings, not sideways skates. */
  if (ry.grounded && vyBeforeMove > LANDING_VY_THRESHOLD) {
    let ld = LANDING_VX_DAMP;
    if (fusionMoveStyle(ash) === "bio") ld *= 0.88;
    ash.vx *= ld;
  }

  /* Dash / mecha burst ended this fixed step: cut carried vx so the move
     doesn’t decay slowly into a “slide” on the next frames. */
  if (dashMsAtStepStart > 0 && ash.dashRemainingMs <= 0) {
    let endMult = DASH_END_VX_MULT;
    if (fusionMoveStyle(ash) === "mecha") endMult *= 0.86;
    ash.vx *= endMult;
    if (Math.abs(ash.vx) < 12) ash.vx = 0;
  }

  if (
    input.attackPressed &&
    ash.attackCooldownMs <= 0 &&
    !dashing
  ) {
    ash.attackCooldownMs = ATTACK_COOLDOWN_MS;
    const hx = ash.facing === 1 ? ash.x + ash.width : ash.x - ATTACK_HIT_W;
    const hy = ash.y + ash.height * 0.35;
    ash.hitbox = {
      active: true,
      x: hx,
      y: hy,
      w: ATTACK_HIT_W,
      h: ATTACK_HIT_H,
      damage: ATTACK_DAMAGE,
      ttl: ATTACK_ACTIVE_MS,
      hurtsEnemies: true,
    };
  }

  if (
    input.unstablePressed &&
    ash.unstableCooldownMs <= 0 &&
    fusionMotionReady(ash)
  ) {
    ash.unstableCooldownMs = UNSTABLE_COOLDOWN_MS;
    ash.unstableFlashMs = UNSTABLE_FLASH_MS;
    const ch = ash.unstableNextChannel;
    ash.unstableChannel = ch;
    ash.unstableNextChannel = modChannel(ch + 1);
    if (ch === 0) {
      ash.fusionMoveChannel = 0;
      ash.fusionMoveMs = FUSION_BIO_MOVE_MS;
      ash.vx += ash.facing * BIO_BURST_VX;
      ash.vy += BIO_BURST_VY;
      const hx = ash.facing === 1 ? ash.x + ash.width - 4 : ash.x - 44;
      ash.hitbox = {
        active: true,
        x: hx,
        y: ash.y + 8,
        w: 48,
        h: 32,
        damage: 2,
        ttl: ATTACK_ACTIVE_MS + 40,
        hurtsEnemies: true,
      };
    } else if (ch === 1) {
      ash.fusionMoveChannel = 1;
      ash.fusionMoveMs = FUSION_MECHA_MOVE_MS;
      ash.dashRemainingMs = MECHA_DASH_MS;
      ash.vx = ash.facing * (DASH_SPEED * 1.05);
      ash.vy *= 0.2;
    } else {
      ash.fusionMoveChannel = null;
      ash.fusionMoveMs = 0;
      /* Pure: route-sense + smoother movement while fusion sense lasts. */
      ash.fusionPureSenseMs = PERCEPTION_MS;
    }
  }

  const ar = ashBounds(ash);
  for (const e of s.level.entities) {
    if (isCheckpoint(e) && rectsOverlap(ar, e)) {
      ash.respawnX = e.x + e.w / 2 - ash.width / 2;
      ash.respawnY = e.y + e.h - ash.height;
      ash.hp = ash.maxHp;
    }
    if (isBossGate(e) && rectsOverlap(ar, e)) {
      if (!s.bossGateTriggered) {
        s.bossGateTriggered = true;
        s.beat = { id: "gate", text: e.enterLine, ttlMs: 4200 };
      }
    }
  }

  if (s.bossGateTriggered && !s.minibossSpawned) {
    s.minibossSpawned = true;
    s.enemies = [...s.enemies, createMinibossForLevel(s.level.id, floorY)];
  }

  const exit = findExit(s.level);
  if (exit && rectsOverlap(ar, exit)) {
    const minibossAlive = s.enemies.some((en) => en.isMiniboss && en.hp > 0);
    if (!minibossAlive) {
      s.phase = "won";
      s.beat = {
        id: "escaped",
        text: "Hatch gives—cold street, wrong city.\nRight breath. Gone.",
        ttlMs: 4800,
      };
    }
  }

  let hazardAcc = s.hazardAccMs + dtMs;
  let tookHazard = false;
  if (hazardAcc >= HAZARD_TICK_MS) {
    hazardAcc = 0;
    for (const e of s.level.entities) {
      if (!isHazard(e)) continue;
      if (rectsOverlap(ar, e) && ash.invulnMs <= 0) {
        ash.hp -= (e.dps * HAZARD_TICK_MS) / 1000;
        tookHazard = true;
      }
    }
  }
  s.hazardAccMs = hazardAcc;

  if (tookHazard) ash.invulnMs = Math.max(ash.invulnMs, 400);

  const sentinelAliveBefore = s.enemies.some(
    (en) => en.isMiniboss && en.hp > 0,
  );

  let enemies = s.enemies.map((en) => ({ ...en }));
  const er: Rect = { x: 0, y: 0, w: 0, h: 0 };
  let hitStopMs = 0;

  for (let i = 0; i < enemies.length; i++) {
    let en = enemies[i]!;
    if (en.hp <= 0) continue;
    if (en.hurtCooldownMs > 0) {
      en = { ...en, hurtCooldownMs: Math.max(0, en.hurtCooldownMs - dtMs) };
    }
    er.x = en.x;
    er.y = en.y;
    er.w = en.w;
    er.h = en.h;

    if (
      ash.hitbox.active &&
      ash.hitbox.hurtsEnemies &&
      rectsOverlap(ash.hitbox, er) &&
      en.hurtCooldownMs <= 0
    ) {
      en = {
        ...en,
        hp: en.hp - ash.hitbox.damage,
        hurtCooldownMs: 380,
      };
      /* Subtle freeze: one duration cap per step (no stacking multi-hits). */
      hitStopMs = Math.max(hitStopMs, HIT_STOP_MS);
    }

    if (rectsOverlap(ar, er) && ash.invulnMs <= 0) {
      ash.hp -= en.damage;
      ash.invulnMs = INVULN_AFTER_HIT_MS;
      /* Knockback away from enemy mass (fair read vs fixed -facing shove). */
      const ecx = en.x + en.w / 2;
      const acx = ash.x + ash.width / 2;
      const away = acx >= ecx ? 1 : -1;
      ash.vx = away * ENEMY_CONTACT_KNOCKBACK_VX;
      ash.vy = ENEMY_CONTACT_KNOCKBACK_VY;
    }

    const pdt = (en.vx * dt) / 1000;
    let nx = en.x + pdt;
    if (nx <= en.patrolLeft || nx + en.w >= en.patrolRight) {
      en.vx = -en.vx;
      nx = clamp(nx, en.patrolLeft, en.patrolRight - en.w);
    }
    en = { ...en, x: nx };
    enemies[i] = en;
  }

  enemies = enemies.filter((en) => en.hp > 0);

  const sentinelAliveAfter = enemies.some(
    (en) => en.isMiniboss && en.hp > 0,
  );
  if (
    sentinelAliveBefore &&
    !sentinelAliveAfter &&
    s.phase === "playing"
  ) {
    s.beat = {
      id: "sentinel_down",
      text: "Sentinel folds—hatch stutters green.\nDon't admire it. Move.",
      ttlMs: 2600,
    };
  }

  if (ash.hp <= 0) {
    ash.hp = ash.maxHp;
    ash.x = ash.respawnX;
    ash.y = ash.respawnY;
    ash.vx = 0;
    ash.vy = 0;
    ash.dashCooldownMs = 0;
    ash.dashRemainingMs = 0;
    ash.attackCooldownMs = 0;
    ash.hitbox = { ...ash.hitbox, active: false, ttl: 0 };
    ash.unstableCooldownMs = 0;
    ash.unstableFlashMs = 0;
    ash.unstableChannel = null;
    ash.fusionMoveMs = 0;
    ash.fusionMoveChannel = null;
    ash.fusionPureSenseMs = 0;
    ash.perceptionRemainingMs = 0;
    ash.perceptionCooldownRemainingMs = 0;
    ash.perceptionActive = false;
    ash.wallContactSide = 0;
    ash.wallSlideActive = false;
    ash.wallJumpLockoutMs = 0;
    ash.invulnMs = INVULN_AFTER_HIT_MS;
    s.beat = {
      id: "down",
      text: "Ash hits tile—fusion stutters.\nBreathe. Again.",
      ttlMs: 3600,
    };
  }

  ash.hp = clamp(ash.hp, 0, ash.maxHp);

  ash.perceptionActive = ash.perceptionRemainingMs > 0;

  s.ash = ash;
  s.enemies = enemies;

  const focusX = ash.x + ash.width / 2 + ash.facing * CAMERA_LOOKAHEAD_PX;
  s.cameraX = clamp(
    focusX - VIEW_WIDTH / 2,
    0,
    Math.max(0, s.level.width - VIEW_WIDTH),
  );

  updateTimeShadows(
    s.timeShadow,
    {
      level: s.level,
      ash,
      enemies,
      phase: s.phase,
    },
    dtMs,
  );

  return {
    ...s,
    hitStopRemainingMs: hitStopMs,
  };
}
