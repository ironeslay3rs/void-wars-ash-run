import type { LevelDef } from "./types";

/**
 * Blackcity Lab — Hatch (Folio I.c).
 *
 * Third lab beat: sentinel chamber + hatch run. Showcases authored
 * resonance traces — hand-placed victim-path + safe-route ink through
 * the split floor bite and chamber entry puddles. Clears to Training Yard.
 *
 * Lab vocabulary: sentinel chamber, hatch bay, seal stutter.
 * Canon: intro beat escapes the lab — "cold street, wrong city."
 */
export function createBlackcityLabHatchLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 1680;

  return {
    id: "blackcity_lab_hatch",
    name: "Blackcity Lab — Hatch (Folio I.c)",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },

      /* --- Boss gate trigger (seal stutter) --- */
      {
        kind: "boss_gate",
        x: 160,
        y: 0,
        w: 44,
        h: 520,
        enterLine:
          "Floor shudders—red wash seals behind her.\nNo questions. Hatch is the door. Run.",
      },

      /* --- Sentinel chamber + wall-jump chute (carried over from prior slice) --- */
      { kind: "solid", x: 240, y: 172, w: 600, h: 26 },
      { kind: "solid", x: 270, y: 198, w: 48, h: 282 },
      { kind: "solid", x: 768, y: 358, w: 48, h: 122 },
      { kind: "solid", x: 440, y: 268, w: 200, h: 20 },
      { kind: "solid", x: 382, y: 296, w: 22, h: 180 },

      /* Chamber entry: staggered puddle widths — slit + nail are the fair line. */
      {
        kind: "hazard",
        x: 318,
        y: floorY - 30,
        w: 32,
        h: 30,
        dps: 2.1,
        preEcho: true,
      },
      { kind: "solid", x: 350, y: floorY - 11, w: 28, h: 11 },
      {
        kind: "hazard",
        x: 378,
        y: floorY - 30,
        w: 36,
        h: 30,
        dps: 2.1,
        preEcho: true,
      },

      /* --- Hatch run — split floor bite; center nail rewards spatial read --- */
      {
        kind: "hazard",
        x: 738,
        y: floorY - 26,
        w: 38,
        h: 26,
        dps: 2.36,
        preEcho: true,
      },
      { kind: "solid", x: 776, y: floorY - 12, w: 24, h: 12 },
      {
        kind: "hazard",
        x: 800,
        y: floorY - 26,
        w: 32,
        h: 26,
        dps: 2.36,
        preEcho: true,
      },
      { kind: "solid", x: 840, y: 444, w: 206, h: 22 },
      { kind: "solid", x: 1000, y: 392, w: 112, h: 22 },
      { kind: "solid", x: 1108, y: 330, w: 72, h: 22 },
      {
        kind: "exit",
        x: 1120,
        y: 214,
        w: 48,
        h: 86,
      },

      /* --- Authored victim-path: prior escapee misread the chamber entry --- */
      {
        kind: "resonance_trace",
        x: 310,
        y: 450,
        traceKind: "victim_path",
        points: [
          { x: 310, y: 458 },
          { x: 334, y: 462 },
          { x: 362, y: 460 },
          { x: 396, y: 462 },
          { x: 430, y: 456 },
        ],
        intensityFalloff: 0.85,
      },
      /* --- Authored safe-route across the split hatch bite --- */
      {
        kind: "resonance_trace",
        x: 735,
        y: 460,
        traceKind: "safe_route",
        points: [
          { x: 735, y: 462 },
          { x: 778, y: 462 },
          { x: 790, y: 460 },
          { x: 810, y: 462 },
          { x: 840, y: 462 },
        ],
        intensityFalloff: 0.75,
      },
    ],
  };
}
