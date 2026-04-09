import type { LevelDef } from "./types";

/**
 * Folio III — vault arc. Unlocks after Folio II; boss gate spawns the vault warden
 * (see `createVaultWardenMiniboss`); exit stays sealed until the warden falls.
 */
export function createFolioVaultLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 2280;

  return {
    id: "folio_iii_vault",
    name: "Vault Arc — Folio III",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },

      /* Approach — ledges over acid */
      { kind: "solid", x: 72, y: 392, w: 200, h: 20 },
      { kind: "solid", x: 340, y: 328, w: 160, h: 18 },
      {
        kind: "hazard",
        x: 280,
        y: floorY - 40,
        w: 200,
        h: 40,
        dps: 2.0,
      },
      { kind: "solid", x: 520, y: 276, w: 140, h: 18 },
      {
        kind: "hazard",
        x: 500,
        y: floorY - 36,
        w: 120,
        h: 36,
        dps: 2.15,
      },

      /* Mid corridor — desync patrol */
      { kind: "solid", x: 680, y: 360, w: 420, h: 22 },
      {
        kind: "patrol",
        id: "vault_drone",
        x: 920,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: -95,
        patrolLeft: 700,
        patrolRight: 1060,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },
      { kind: "solid", x: 1120, y: 300, w: 100, h: 18 },

      /* Nail between twin pools */
      {
        kind: "hazard",
        x: 1240,
        y: floorY - 34,
        w: 72,
        h: 34,
        dps: 2.35,
      },
      { kind: "solid", x: 1312, y: floorY - 11, w: 36, h: 11 },
      {
        kind: "hazard",
        x: 1348,
        y: floorY - 34,
        w: 72,
        h: 34,
        dps: 2.35,
      },
      { kind: "solid", x: 1280, y: 240, w: 180, h: 18 },

      {
        kind: "checkpoint",
        id: "vault_mid",
        x: 1360,
        y: 200,
        w: 48,
        h: 76,
      },

      /* Seal */
      {
        kind: "boss_gate",
        x: 1488,
        y: 0,
        w: 44,
        h: 520,
        enterLine:
          "Vault jaws shut—no ledger, no witness.\nWarden wakes. Finish it or stay in the ink.",
      },

      /* Arena */
      { kind: "solid", x: 1556, y: 188, w: 520, h: 24 },
      { kind: "solid", x: 1588, y: 368, w: 40, h: 112 },
      { kind: "solid", x: 2004, y: 368, w: 40, h: 112 },
      {
        kind: "hazard",
        x: 1628,
        y: floorY - 28,
        w: 44,
        h: 28,
        dps: 2.05,
      },
      { kind: "solid", x: 1672, y: floorY - 12, w: 32, h: 12 },
      {
        kind: "hazard",
        x: 1704,
        y: floorY - 28,
        w: 44,
        h: 28,
        dps: 2.05,
      },
      { kind: "solid", x: 1760, y: 288, w: 160, h: 20 },
      { kind: "solid", x: 1920, y: 420, w: 200, h: 22 },
      { kind: "solid", x: 2100, y: 352, w: 100, h: 20 },
      {
        kind: "exit",
        x: 2140,
        y: 236,
        w: 48,
        h: 86,
      },
    ],
  };
}
