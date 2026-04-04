import { createLabSentinelMiniboss } from "../entities/enemy";
import type { UnstableChannel } from "../entities/types";
import { findExit, isBossGate, isCheckpoint, isHazard, solidsOf } from "../level/queries";
import type { Rect } from "../level/types";
import {
  ashBounds,
  clamp,
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
  DASH_MS,
  DASH_SPEED,
  FRICTION_AIR,
  FRICTION_GROUND,
  GRAVITY,
  HAZARD_TICK_MS,
  INVULN_AFTER_HIT_MS,
  JUMP_BUFFER_MS,
  JUMP_VELOCITY,
  MAX_FALL_SPEED,
  MECHA_DASH_MS,
  MOVE_ACCEL,
  MOVE_MAX,
  PERCEPTION_MS,
  PERCEPTION_SCALE,
  UNSTABLE_COOLDOWN_MS,
  UNSTABLE_FLASH_MS,
  VIEW_WIDTH,
} from "./constants";
import type { GameState, InputBits } from "./types";

function randomChannel(): UnstableChannel {
  return Math.floor(Math.random() * 3) as UnstableChannel;
}

export function stepGame(state: GameState, input: InputBits, dtMs: number): GameState {
  if (state.phase !== "playing") return state;

  const s = { ...state };
  const ash = { ...s.ash };
  const solids = solidsOf(s.level);
  const floor = solids.find((x) => x.x === 0 && x.w >= s.level.width - 100);
  const floorY = floor ? floor.y : 480;

  const timeMul = ash.perceptionRemainingMs > 0 ? PERCEPTION_SCALE : 1;
  const dt = dtMs * timeMul;

  if (ash.perceptionRemainingMs > 0) {
    ash.perceptionRemainingMs = Math.max(0, ash.perceptionRemainingMs - dtMs);
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
    ash.unstableCooldownMs = Math.max(0, ash.unstableCooldownMs - dtMs);
  }
  if (ash.unstableFlashMs > 0) {
    ash.unstableFlashMs = Math.max(0, ash.unstableFlashMs - dtMs);
  }
  if (ash.dashRemainingMs > 0) {
    ash.dashRemainingMs = Math.max(0, ash.dashRemainingMs - dtMs);
  }

  if (ash.hitbox.active) {
    ash.hitbox.ttl -= dtMs;
    if (ash.hitbox.ttl <= 0) {
      ash.hitbox = { ...ash.hitbox, active: false, ttl: 0 };
    }
  }

  if (ash.grounded) ash.coyoteMs = COYOTE_MS;
  else ash.coyoteMs = Math.max(0, ash.coyoteMs - dt);

  if (input.jumpPressed) ash.jumpBufferMs = JUMP_BUFFER_MS;
  else ash.jumpBufferMs = Math.max(0, ash.jumpBufferMs - dt);

  if (
    input.dashPressed &&
    ash.dashCooldownMs <= 0 &&
    ash.dashRemainingMs <= 0
  ) {
    ash.dashRemainingMs = DASH_MS;
    ash.dashCooldownMs = DASH_COOLDOWN_MS;
    ash.vy *= 0.35;
  }

  const dashing = ash.dashRemainingMs > 0;
  if (dashing) {
    ash.vx = ash.facing * DASH_SPEED;
    ash.vy = 0;
  } else {
    let target = 0;
    if (input.left) target -= 1;
    if (input.right) target += 1;
    if (target !== 0) ash.facing = (target > 0 ? 1 : -1) as 1 | -1;

    const accel = MOVE_ACCEL * dt * 0.001;
    if (target !== 0) {
      ash.vx += target * accel;
      ash.vx = clamp(ash.vx, -MOVE_MAX, MOVE_MAX);
    } else {
      const f = ash.grounded ? FRICTION_GROUND : FRICTION_AIR;
      ash.vx *= f;
      if (Math.abs(ash.vx) < 8) ash.vx = 0;
    }

    ash.vy = Math.min(MAX_FALL_SPEED, ash.vy + (GRAVITY * dt) / 1000);

    if (ash.jumpBufferMs > 0 && ash.coyoteMs > 0) {
      ash.vy = JUMP_VELOCITY;
      ash.jumpBufferMs = 0;
      ash.coyoteMs = 0;
      ash.grounded = false;
    }
  }

  const dx = (ash.vx * dt) / 1000;
  ash.x = resolveX(ash, solids, dx);
  ash.x = clamp(ash.x, 0, s.level.width - ash.width);

  const dy = (ash.vy * dt) / 1000;
  const ry = resolveY(ash, solids, dy);
  ash.y = ry.y;
  ash.grounded = ry.grounded;
  if (ash.grounded && ash.vy > 0) ash.vy = 0;

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

  if (input.unstablePressed && ash.unstableCooldownMs <= 0) {
    ash.unstableCooldownMs = UNSTABLE_COOLDOWN_MS;
    ash.unstableFlashMs = UNSTABLE_FLASH_MS;
    const ch = randomChannel();
    ash.unstableChannel = ch;
    if (ch === 0) {
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
      ash.dashRemainingMs = MECHA_DASH_MS;
      ash.vx = ash.facing * (DASH_SPEED * 1.05);
      ash.vy *= 0.2;
    } else {
      ash.perceptionRemainingMs = PERCEPTION_MS;
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
        s.beat = { id: "gate", text: e.enterLine, ttlMs: 6000 };
      }
    }
  }

  if (s.bossGateTriggered && !s.minibossSpawned) {
    s.minibossSpawned = true;
    s.enemies = [...s.enemies, createLabSentinelMiniboss(floorY)];
  }

  const exit = findExit(s.level);
  if (exit && rectsOverlap(ar, exit)) {
    const minibossAlive = s.enemies.some((en) => en.isMiniboss && en.hp > 0);
    if (!minibossAlive) {
      s.phase = "won";
      s.beat = {
        id: "escaped",
        text: "The hatch gives. Cold street air—wrong city, right breath. Run isn't over; it's just real now.",
        ttlMs: 8000,
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

  let enemies = s.enemies.map((en) => ({ ...en }));
  const er: Rect = { x: 0, y: 0, w: 0, h: 0 };

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
    }

    if (rectsOverlap(ar, er) && ash.invulnMs <= 0) {
      ash.hp -= en.damage;
      ash.invulnMs = INVULN_AFTER_HIT_MS;
      ash.vx = -ash.facing * 220;
      ash.vy = -180;
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

  if (ash.hp <= 0) {
    ash.hp = ash.maxHp;
    ash.x = ash.respawnX;
    ash.y = ash.respawnY;
    ash.vx = 0;
    ash.vy = 0;
    ash.invulnMs = INVULN_AFTER_HIT_MS;
    s.beat = {
      id: "down",
      text: "Ash hits tile—fusion stutters, body remembers the lab floor. Checkpoint breath. Go again.",
      ttlMs: 3800,
    };
  }

  ash.hp = clamp(ash.hp, 0, ash.maxHp);

  s.ash = ash;
  s.enemies = enemies;

  s.cameraX = clamp(
    ash.x + ash.width / 2 - VIEW_WIDTH / 2,
    0,
    Math.max(0, s.level.width - VIEW_WIDTH),
  );

  return s;
}
