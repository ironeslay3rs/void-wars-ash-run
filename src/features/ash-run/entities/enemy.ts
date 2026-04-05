import type { PatrolEnemy } from "./types";

/** Miniboss spawned when Ash crosses the lab boss gate — arena matches blackcity-lab zone 7. */
export function createLabSentinelMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "lab_sentinel",
    x: 2940,
    y: floorY - 52,
    w: 40,
    h: 44,
    vx: -60,
    patrolLeft: 2760,
    patrolRight: 3160,
    hp: 6,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}
