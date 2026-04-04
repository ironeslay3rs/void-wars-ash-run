import { createAsh } from "../entities/ash";
import { createBlackcityLabLevel } from "../level/blackcity-lab";
import { isPatrol, solidsOf } from "../level/queries";
import { ASH_HEIGHT } from "./constants";
import type { GameState } from "./types";

export function createInitialGameState(): GameState {
  const level = createBlackcityLabLevel();
  const solids = solidsOf(level);
  const floor = solids.find((s) => s.x === 0 && s.w >= level.width - 100);
  const floorY = floor ? floor.y : 480;
  const startX = 108;
  const startY = floorY - ASH_HEIGHT - 2;

  const ash = createAsh(startX, startY);
  const enemies = level.entities.filter(isPatrol).map((e) => ({
    ...e,
    hurtCooldownMs: e.hurtCooldownMs ?? 0,
  }));

  return {
    level,
    ash,
    enemies,
    phase: "playing",
    cameraX: 0,
    beat: {
      id: "intro",
      text: "Ash — stolen name, borrowed bones. The lab hums; the fusion in his ribs doesn't know whose child it is.",
      ttlMs: 5200,
    },
    bossGateTriggered: false,
    minibossSpawned: false,
    hazardAccMs: 0,
  };
}
