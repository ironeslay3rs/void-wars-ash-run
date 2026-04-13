/**
 * AR-2.5 Dead Cells zone biomes.
 *
 * Each zone has its own aesthetic palette, hazard set, music identity, and
 * BPM. BPM per spec:
 *  - Lab                     80 bpm  (sterile, tense, creeping)
 *  - Black City outskirts   120 bpm  (chaotic, shifts 100–140)
 *  - Verdant Coil           100 bpm  (tribal, primal, steady)
 *  - Chrome Synod           140 bpm  (electronic, precise, fastest)
 *  - Ember Vault             90 bpm  (choral, soul-deep, each beat heavy)
 *  - Deep Lab            variable    (corrupted; mastery test — shifts bpm)
 *
 * Biome config is authoring metadata only — no runtime allocation here.
 */

import type { ZoneId } from "./zones";

export type BiomeMusicShape =
  | { kind: "fixed"; bpm: number }
  | { kind: "shifting"; baseBpm: number; minBpm: number; maxBpm: number };

export type BiomeConfig = {
  id: ZoneId;
  /** Short palette hint for authoring — not a runtime color. */
  palette: string;
  hazards: readonly string[];
  musicMood: string;
  bpm: BiomeMusicShape;
};

export const BIOMES: readonly BiomeConfig[] = [
  {
    id: "lab_containment",
    palette: "sterile white, flickering fluorescents, pod glass",
    hazards: ["containment field", "auto-security drone", "laser grid"],
    musicMood: "sterile silence with an emerging heartbeat",
    bpm: { kind: "fixed", bpm: 80 },
  },
  {
    id: "lab_deep",
    palette: "deep shaft dim, lock-brace sodium light",
    hazards: ["lock-brace clamps", "shaft drones", "acid dribble"],
    musicMood: "low heartbeat, tighter pulse",
    bpm: { kind: "fixed", bpm: 80 },
  },
  {
    id: "lab_hatch",
    palette: "hatch-bay red alert, containment overflow",
    hazards: ["sentinel beam", "acid wash", "quarantine snap"],
    musicMood: "alarm rhythm, sentinel's slow stomp",
    bpm: { kind: "fixed", bpm: 80 },
  },
  {
    id: "blackcity_outskirts",
    palette: "neon rain, wet concrete, market stalls",
    hazards: ["falling debris", "unstable platforms", "street patrol"],
    musicMood: "chaos pulse, streetfront sampling",
    bpm: { kind: "shifting", baseBpm: 120, minBpm: 100, maxBpm: 140 },
  },
  {
    id: "blackcity_market",
    palette: "braided neon spine, black slick, signage",
    hazards: ["thief hands", "gang patrol", "unstable catwalks"],
    musicMood: "market crowd rhythm, polytempo",
    bpm: { kind: "shifting", baseBpm: 120, minBpm: 100, maxBpm: 140 },
  },
  {
    id: "verdant_coil_entry",
    palette: "overgrown bio-organic, pulsing vines, living wall",
    hazards: ["carnivorous bloom", "toxic spore", "predator stalker"],
    musicMood: "tribal drums, heartbeat bass",
    bpm: { kind: "fixed", bpm: 100 },
  },
  {
    id: "chrome_synod_entry",
    palette: "gleaming chrome, holo-displays, data streams",
    hazards: ["turret", "electrified floor", "clockwork crusher"],
    musicMood: "electronic precision, synth arpeggio",
    bpm: { kind: "fixed", bpm: 140 },
  },
  {
    id: "ember_vault_entry",
    palette: "ancient temple gold, floating candles, prayer ink",
    hazards: ["spiritual guardian", "resonance trap", "memory flood"],
    musicMood: "choral voices, bell tones, resonant bass",
    bpm: { kind: "fixed", bpm: 90 },
  },
  {
    id: "deep_lab_return",
    palette: "lab corrupted by Void, reality shear, memory leak",
    hazards: ["Void shear", "memory hazard", "remixed lab hazards"],
    musicMood: "distorted lab theme braided with all empires",
    bpm: {
      kind: "shifting",
      baseBpm: 110,
      minBpm: 80,
      maxBpm: 140,
    },
  },
  {
    id: "iron_sanctum",
    palette: "quiet endpage, single lamp, warm stone",
    hazards: [],
    musicMood: "single sustained chord, held",
    bpm: { kind: "fixed", bpm: 60 },
  },
];

export function biomeFor(id: ZoneId): BiomeConfig {
  const b = BIOMES.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown biome: ${id}`);
  return b;
}

/** Base BPM used at zone load. Shifting zones drift around this value. */
export function baseBpmForZone(id: ZoneId): number {
  const b = biomeFor(id);
  return b.bpm.kind === "fixed" ? b.bpm.bpm : b.bpm.baseBpm;
}
