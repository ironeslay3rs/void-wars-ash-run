import {
  ASH_HEIGHT,
  ASH_WIDTH,
  ATTACK_DAMAGE,
} from "../core/constants";
import type { Ash, Hitbox } from "./types";

function inactiveHitbox(damage: number): Hitbox {
  return {
    active: false,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    damage,
    ttl: 0,
    hurtsEnemies: true,
  };
}

/** Spawn Ash at lab floor start (Blackcity escape slice). */
export function createAsh(spawnX: number, spawnY: number): Ash {
  return {
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    coyoteMs: 0,
    jumpBufferMs: 0,
    hp: 3,
    maxHp: 3,
    invulnMs: 0,
    attackCooldownMs: 0,
    hitbox: inactiveHitbox(ATTACK_DAMAGE),
    dashCooldownMs: 0,
    dashRemainingMs: 0,
    respawnX: spawnX,
    respawnY: spawnY,
    unstableCooldownMs: 0,
    unstableFlashMs: 0,
    unstableChannel: null,
    unstableNextChannel: 0,
    fusionMoveMs: 0,
    fusionMoveChannel: null,
    fusionPureSenseMs: 0,
    perceptionRemainingMs: 0,
    perceptionCooldownRemainingMs: 0,
    perceptionActive: false,
    wallContactSide: 0,
    wallSlideActive: false,
    wallJumpLockoutMs: 0,
    width: ASH_WIDTH,
    height: ASH_HEIGHT,
  };
}
