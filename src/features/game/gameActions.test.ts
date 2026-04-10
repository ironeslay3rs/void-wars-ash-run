import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyGameAction,
  HEIST_CREDITS_BRISK,
  HEIST_CREDITS_LIGHT,
  HEIST_CREDITS_TARGET,
} from "./gameActions";
import { createInitialGameState } from "./initialGameState";
import type { GameState } from "./gameTypes";

function fresh(): GameState {
  return createInitialGameState();
}

describe("applyGameAction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("scavenge advances day and increases scrap", () => {
    const s0 = fresh();
    const s1 = applyGameAction(s0, { type: "scavenge" });
    expect(s1.day).toBe(s0.day + 1);
    expect(s1.scrap).toBeGreaterThanOrEqual(s0.scrap);
  });

  it("sell_scrap does not advance day", () => {
    const s0 = { ...fresh(), scrap: 10 };
    const s1 = applyGameAction(s0, { type: "sell_scrap" });
    expect(s1.day).toBe(s0.day);
    expect(s1.credits).toBeGreaterThan(s0.credits);
  });

  it("applies stress meltdown when at 100 stress and off cooldown", () => {
    const s0: GameState = {
      ...fresh(),
      day: 5,
      stress: 100,
      credits: 40,
      scrap: 4,
      nextMeltdownAllowedAfterDay: 0,
    };
    const s1 = applyGameAction(s0, { type: "buy_intel" });
    expect(s1.stress).toBe(38);
    expect(s1.health).toBe(s0.health - 10);
    expect(s1.nextMeltdownAllowedAfterDay).toBe(s0.day + 2);
  });

  it("skips meltdown during cooldown", () => {
    const s0: GameState = {
      ...fresh(),
      day: 4,
      stress: 100,
      credits: 20,
      nextMeltdownAllowedAfterDay: 5,
    };
    const s1 = applyGameAction(s0, { type: "buy_intel" });
    expect(s1.stress).toBe(100);
    expect(s1.health).toBe(s0.health);
  });

  it("sets victory when a day action reaches day 30", () => {
    const s0: GameState = { ...fresh(), day: 29, victoryTargetDay: 30 };
    const s1 = applyGameAction(s0, { type: "rest" });
    expect(s1.day).toBe(30);
    expect(s1.victory).toBe(true);
  });

  it("sprint run wins at day 15", () => {
    const s0: GameState = { ...fresh(), day: 14, victoryTargetDay: 15 };
    const s1 = applyGameAction(s0, { type: "rest" });
    expect(s1.day).toBe(15);
    expect(s1.victory).toBe(true);
    expect(s1.log.some((l) => l.includes("sprint"))).toBe(true);
  });

  it("does not mutate input state objects", () => {
    const s0 = fresh();
    const dayBefore = s0.day;
    applyGameAction(s0, { type: "work" });
    expect(s0.day).toBe(dayBefore);
  });

  it("fight win branch adds credits when random is low", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.01);
    const s0 = fresh();
    const s1 = applyGameAction(s0, { type: "fight" });
    expect(s1.credits).toBeGreaterThan(s0.credits);
    expect(s1.log.some((l) => l.startsWith("Fight:"))).toBe(true);
  });

  it("iron run rejects clinic repair", () => {
    const s0: GameState = {
      ...fresh(),
      ironman: true,
      credits: 100,
    };
    const s1 = applyGameAction(s0, { type: "buy_clinic_repair" });
    expect(s1.credits).toBe(100);
    expect(s1.maxHealth).toBe(s0.maxHealth);
    expect(s1.log.some((l) => l.includes("iron"))).toBe(true);
  });

  it("heist run wins when credits reach goal", () => {
    const s0: GameState = {
      ...createInitialGameState(30, {
        creditsWinTarget: HEIST_CREDITS_TARGET,
      }),
      credits: HEIST_CREDITS_TARGET - 1,
    };
    const s1 = applyGameAction(s0, { type: "sell_scrap" });
    expect(s1.victory).toBe(true);
    expect(s1.log.some((l) => l.includes("heist"))).toBe(true);
  });

  it("light heist wins at lower credit threshold", () => {
    const s0: GameState = {
      ...createInitialGameState(15, {
        creditsWinTarget: HEIST_CREDITS_LIGHT,
      }),
      credits: HEIST_CREDITS_LIGHT - 1,
    };
    const s1 = applyGameAction(s0, { type: "sell_scrap" });
    expect(s1.victory).toBe(true);
  });

  it("brisk heist wins at lowest credit threshold", () => {
    const s0: GameState = {
      ...createInitialGameState(15, {
        creditsWinTarget: HEIST_CREDITS_BRISK,
      }),
      credits: HEIST_CREDITS_BRISK - 1,
    };
    const s1 = applyGameAction(s0, { type: "sell_scrap" });
    expect(s1.victory).toBe(true);
  });
});
