/**
 * AR-2.7 Shovel Knight feats + Celeste B/C-side style Void Challenges.
 *
 * Each zone has 3 challenge tiers:
 *   - Echo    : remixed zone with tighter timing + rhythm combo required
 *   - Fracture: modified physics (low grav / hi speed / reversed controls)
 *   - Void    : one life, no checkpoints, perfect rhythm required
 *
 * Clearing a tier grants a cosmetic/rhythm/golden reward per spec. Feats are
 * per-zone achievements (no-death, all-perfect, all-secrets) that layer on top.
 *
 * Canon anchors:
 *  - "Kill Your Idols" — prove yourself.
 *  - "The Ember Outlasts the Storm" — soul survives.
 */

import type { ZoneId } from "../world/zones";

export type ChallengeTier = "echo" | "fracture" | "void";

export type ChallengeReward =
  | { kind: "cosmetic"; label: string }
  | { kind: "rhythm_mod"; label: string; bpmBonus: number }
  | { kind: "golden_trail"; label: string };

export type ChallengeDef = {
  id: string;
  zoneId: ZoneId;
  tier: ChallengeTier;
  /** Short blurb for the map card / challenge select. */
  blurb: string;
  reward: ChallengeReward;
};

export type FeatId =
  | "no_death"
  | "all_perfect_rhythm"
  | "all_secrets"
  | "iron_man";

export type Feat = {
  id: FeatId;
  label: string;
  blurb: string;
  /** Iron Man applies to the full game, not a single zone. */
  scope: "zone" | "global";
};

export const FEATS: readonly Feat[] = [
  {
    id: "no_death",
    label: "Unbroken",
    blurb: "Clear the zone without a single death.",
    scope: "zone",
  },
  {
    id: "all_perfect_rhythm",
    label: "On the Beat",
    blurb: "Every graded action lands at PERFECT.",
    scope: "zone",
  },
  {
    id: "all_secrets",
    label: "Full Memory",
    blurb: "Collect every Memory Fragment in the zone.",
    scope: "zone",
  },
  {
    id: "iron_man",
    label: "Iron Man",
    blurb: "Clear the entire game, no deaths, no assists.",
    scope: "global",
  },
];

function makeTierSet(zoneId: ZoneId, outfit: string): ChallengeDef[] {
  return [
    {
      id: `${zoneId}_echo`,
      zoneId,
      tier: "echo",
      blurb: "Remixed hazards. Maintain a rhythm combo to clear.",
      reward: { kind: "cosmetic", label: `${outfit} — Echo` },
    },
    {
      id: `${zoneId}_fracture`,
      zoneId,
      tier: "fracture",
      blurb: "Modified physics. Reversed controls. Trust the beat.",
      reward: {
        kind: "rhythm_mod",
        label: `${outfit} — Fracture bonus`,
        bpmBonus: 10,
      },
    },
    {
      id: `${zoneId}_void`,
      zoneId,
      tier: "void",
      blurb: "One life, no checkpoints, perfect rhythm required.",
      reward: { kind: "golden_trail", label: `${outfit} — Void trail` },
    },
  ];
}

export const CHALLENGES: readonly ChallengeDef[] = [
  ...makeTierSet("lab_containment", "Ash in white"),
  ...makeTierSet("lab_deep", "Ash in cell-grey"),
  ...makeTierSet("lab_hatch", "Ash in alarm-red"),
  ...makeTierSet("blackcity_outskirts", "Ash in neon"),
  ...makeTierSet("blackcity_market", "Ash in market-cloak"),
  ...makeTierSet("verdant_coil_entry", "Ash in Coil green"),
  ...makeTierSet("chrome_synod_entry", "Ash in Synod chrome"),
  ...makeTierSet("ember_vault_entry", "Ash in Vault gold"),
  ...makeTierSet("deep_lab_return", "Ash in Void-black"),
];

export function challengesInZone(zone: ZoneId): ChallengeDef[] {
  return CHALLENGES.filter((c) => c.zoneId === zone);
}

export function challengeByTier(
  zone: ZoneId,
  tier: ChallengeTier,
): ChallengeDef | null {
  return CHALLENGES.find((c) => c.zoneId === zone && c.tier === tier) ?? null;
}

/** Leaderboard record — keep the data model local; networking comes later. */
export type LeaderboardEntry = {
  challengeId: string;
  playerId: string;
  timeMs: number;
  /** ISO date of the clear, for sort ties. */
  clearedAt: string;
};

export function sortLeaderboard(
  entries: readonly LeaderboardEntry[],
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
    return a.clearedAt.localeCompare(b.clearedAt);
  });
}
