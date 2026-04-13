import { describe, expect, it } from "vitest";
import {
  CHALLENGES,
  FEATS,
  challengeByTier,
  challengesInZone,
  sortLeaderboard,
  type LeaderboardEntry,
} from "./void-challenges";

describe("AR-2.7 void challenges", () => {
  it("every zone with challenges has all three tiers (echo / fracture / void)", () => {
    const zones = new Set(CHALLENGES.map((c) => c.zoneId));
    for (const z of zones) {
      const set = challengesInZone(z);
      expect(set).toHaveLength(3);
      const tiers = new Set(set.map((c) => c.tier));
      expect(tiers.has("echo")).toBe(true);
      expect(tiers.has("fracture")).toBe(true);
      expect(tiers.has("void")).toBe(true);
    }
  });

  it("rewards escalate: echo=cosmetic, fracture=rhythm_mod, void=golden_trail", () => {
    const z = "verdant_coil_entry";
    expect(challengeByTier(z, "echo")?.reward.kind).toBe("cosmetic");
    expect(challengeByTier(z, "fracture")?.reward.kind).toBe("rhythm_mod");
    expect(challengeByTier(z, "void")?.reward.kind).toBe("golden_trail");
  });

  it("feats include Iron Man with global scope", () => {
    const im = FEATS.find((f) => f.id === "iron_man");
    expect(im?.scope).toBe("global");
  });

  it("leaderboard sorts by time asc, then by clearedAt", () => {
    const entries: LeaderboardEntry[] = [
      { challengeId: "x", playerId: "b", timeMs: 30000, clearedAt: "2026-04-13" },
      { challengeId: "x", playerId: "a", timeMs: 20000, clearedAt: "2026-04-14" },
      { challengeId: "x", playerId: "c", timeMs: 20000, clearedAt: "2026-04-13" },
    ];
    const sorted = sortLeaderboard(entries);
    expect(sorted[0].playerId).toBe("c"); // 20000 + earlier date
    expect(sorted[1].playerId).toBe("a"); // 20000 + later date
    expect(sorted[2].playerId).toBe("b");
  });
});
