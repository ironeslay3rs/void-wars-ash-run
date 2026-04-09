import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./initialGameState";
import { mergeLoadedState } from "./gameUtils";

describe("mergeLoadedState", () => {
  it("merges legacy upgrades into installedUpgrades", () => {
    const def = createInitialGameState();
    const merged = mergeLoadedState(
      { upgrades: ["scavenger_rig"], day: 5, credits: 10 },
      def,
    );
    expect(merged.installedUpgrades).toEqual(["scavenger_rig"]);
    expect(merged.day).toBe(5);
    expect(merged.credits).toBe(10);
  });

  it("prefers installedUpgrades over legacy upgrades when both exist", () => {
    const def = createInitialGameState();
    const merged = mergeLoadedState(
      {
        installedUpgrades: ["nerve_patch"],
        upgrades: ["scavenger_rig"],
      },
      def,
    );
    expect(merged.installedUpgrades).toEqual(["nerve_patch"]);
  });

  it("fills new fields for older saves", () => {
    const def = createInitialGameState();
    const merged = mergeLoadedState({ day: 2, health: 50 }, def);
    expect(merged.victory).toBe(false);
    expect(merged.bodyRepairUsed).toBe(false);
    expect(merged.nextMeltdownAllowedAfterDay).toBe(0);
    expect(merged.victoryTargetDay).toBe(30);
    expect(merged.ironman).toBe(false);
    expect(merged.creditsWinTarget).toBeNull();
  });

  it("preserves creditsWinTarget when present in save", () => {
    const def = createInitialGameState();
    const merged = mergeLoadedState({ creditsWinTarget: 400, day: 2 }, def);
    expect(merged.creditsWinTarget).toBe(400);
  });

  it("preserves ironman when present in save", () => {
    const def = createInitialGameState();
    const merged = mergeLoadedState({ ironman: true, day: 3 }, def);
    expect(merged.ironman).toBe(true);
    expect(merged.day).toBe(3);
  });

  it("preserves sprint victory target when valid", () => {
    const def = createInitialGameState();
    const merged = mergeLoadedState({ victoryTargetDay: 15 }, def);
    expect(merged.victoryTargetDay).toBe(15);
  });

  it("falls back when victoryTargetDay is invalid", () => {
    const def = createInitialGameState();
    const merged = mergeLoadedState({ victoryTargetDay: 99 }, def);
    expect(merged.victoryTargetDay).toBe(30);
  });
});
