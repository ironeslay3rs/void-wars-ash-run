import type { PatrolEnemy } from "./types";

/** Miniboss spawned when Ash crosses the lab boss gate. */
export function createLabSentinelMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "lab_sentinel",
    x: 1960,
    y: floorY - 52,
    w: 40,
    h: 44,
    vx: -55,
    patrolLeft: 1880,
    patrolRight: 2140,
    hp: 6,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}
