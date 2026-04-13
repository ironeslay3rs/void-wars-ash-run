import { createAsh } from "../entities/ash";
import {
  createLevelForId,
  DEFAULT_LEVEL_ID,
  folioTerritory,
  introBeatForLevel,
} from "../level/catalog";
import { isPatrol, solidsOf } from "../level/queries";
import {
  createTimeShadowState,
  seedLevelPreEchoes,
} from "../perception/timeShadowSystem";
import { ASH_HEIGHT } from "./constants";
import { bpmForTerritory, createRhythmState } from "./rhythm";
import type { GameState } from "./types";

/** New run: Ash spawns with perception timers at 0; step-game drives [E] read. */

export function createInitialGameState(levelId: string = DEFAULT_LEVEL_ID): GameState {
  const level = createLevelForId(levelId);
  const solids = solidsOf(level);
  const floor = solids.find((s) => s.x === 0 && s.w >= level.width - 100);
  const floorY = floor ? floor.y : 480;
  const startX = 108;
  const startY = floorY - ASH_HEIGHT - 2;

  const ash = createAsh(startX, startY);
  const intro = introBeatForLevel(level.id);
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
    beat: intro,
    bossGateTriggered: false,
    minibossSpawned: false,
    hazardAccMs: 0,
    hitStopRemainingMs: 0,
    runElapsedMs: 0,
    timeShadow: (() => {
      const t = createTimeShadowState();
      seedLevelPreEchoes(t, level);
      return t;
    })(),
    perceptionHintShown: false,
    perceptionEverUsed: false,
    rhythm: createRhythmState(bpmForTerritory(folioTerritory(level.id))),
  };
}
