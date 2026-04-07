import type { PatrolEnemy } from "./types";

/** Authoring + HUD: sentinel HP budget for this slice. */
export const LAB_SENTINEL_MAX_HP = 4;

/** Miniboss spawned when Ash crosses the lab boss gate — arena matches blackcity-lab zone 7. */
export function createLabSentinelMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "lab_sentinel",
    x: 2970,
    y: floorY - 52,
    w: 40,
    h: 44,
    vx: -88,
    patrolLeft: 2798,
    patrolRight: 3128,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}
