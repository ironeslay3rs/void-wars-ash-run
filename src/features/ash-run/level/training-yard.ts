import type { LevelDef } from "./types";

/**
 * Short second folio — no boss gate / sentinel; reach the exit to clear.
 * Unlocks after Folio I is cleared once; replayable from the map.
 */
export function createTrainingYardLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 1280;

  return {
    id: "training_yard",
    name: "Training Yard — Folio II",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },
      { kind: "solid", x: 220, y: 380, w: 160, h: 18 },
      { kind: "solid", x: 520, y: 320, w: 140, h: 18 },
      { kind: "solid", x: 780, y: 268, w: 120, h: 18 },
      { kind: "solid", x: 960, y: 228, w: 260, h: 18 },
      {
        kind: "hazard",
        x: 380,
        y: floorY - 36,
        w: 100,
        h: 36,
        dps: 1.9,
      },
      {
        kind: "checkpoint",
        id: "yard_mid",
        x: 640,
        y: 360,
        w: 48,
        h: 72,
      },
      {
        kind: "exit",
        x: 1120,
        y: 260,
        w: 48,
        h: 86,
      },
    ],
  };
}
