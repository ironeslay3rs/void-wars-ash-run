import type { GameState, VictoryTargetDay } from "./gameTypes";

export function createInitialGameState(
  victoryTargetDay: VictoryTargetDay = 30,
  opts?: { ironman?: boolean; creditsWinTarget?: number | null },
): GameState {
  const ironman = opts?.ironman ?? false;
  const creditsWinTarget = opts?.creditsWinTarget ?? null;
  const log: string[] = [
    "Day 1 — Grey-market morning. Stats tick whether you move or not; pick an action.",
    `Goal: reach day ${victoryTargetDay} alive. Fence (sell scrap) does not spend a day.`,
    "At 100 stress you snap (HP/credits/scrap hit) — then a two-day cooldown.",
  ];
  if (ironman) {
    log.splice(1, 0, "Iron: clinic is closed — no body repair this run.");
  }
  if (creditsWinTarget != null) {
    const insertAt = ironman ? 2 : 1;
    log.splice(
      insertAt,
      0,
      `Heist: also win at ${creditsWinTarget} credits in hand (day ${victoryTargetDay} still counts).`,
    );
  }
  return {
    day: 1,
    health: 100,
    maxHealth: 100,
    hunger: 55,
    stress: 22,
    credits: 32,
    scrap: 4,
    installedUpgrades: [],
    log,
    gameOver: false,
    gameOverReason: null,
    victory: false,
    victoryReason: null,
    nextMeltdownAllowedAfterDay: 0,
    bodyRepairUsed: false,
    victoryTargetDay,
    ironman,
    creditsWinTarget,
  };
}
