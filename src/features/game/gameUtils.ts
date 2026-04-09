import type { GameState, UpgradeId, VictoryTargetDay } from "./gameTypes";

const STORAGE_KEY = "black-market-survivor-game-v1";

function parseUpgradeIds(v: unknown): UpgradeId[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is UpgradeId =>
    x === "scavenger_rig" || x === "brawler_wraps" || x === "nerve_patch",
  );
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function randomInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/** Deep-merge partial save into defaults so older JSON without new fields still loads. */
export function mergeLoadedState(raw: unknown, defaults: GameState): GameState {
  if (!raw || typeof raw !== "object") return defaults;
  const j = raw as Record<string, unknown>;
  const fromInstalled = parseUpgradeIds(j.installedUpgrades);
  const fromLegacy = parseUpgradeIds(j.upgrades);
  const installed =
    fromInstalled.length > 0
      ? fromInstalled
      : fromLegacy.length > 0
        ? fromLegacy
        : defaults.installedUpgrades;
  const log = Array.isArray(j.log)
    ? j.log.filter((x): x is string => typeof x === "string")
    : defaults.log;

  const maxHealth =
    typeof j.maxHealth === "number" ? j.maxHealth : defaults.maxHealth;
  const rawHealth = typeof j.health === "number" ? j.health : defaults.health;
  return {
    day: typeof j.day === "number" ? j.day : defaults.day,
    health: clamp(rawHealth, 0, maxHealth),
    maxHealth,
    hunger: typeof j.hunger === "number" ? j.hunger : defaults.hunger,
    stress: typeof j.stress === "number" ? j.stress : defaults.stress,
    credits: typeof j.credits === "number" ? j.credits : defaults.credits,
    scrap: typeof j.scrap === "number" ? j.scrap : defaults.scrap,
    installedUpgrades: installed,
    log: log.length > 0 ? log : defaults.log,
    gameOver: typeof j.gameOver === "boolean" ? j.gameOver : defaults.gameOver,
    gameOverReason:
      typeof j.gameOverReason === "string" || j.gameOverReason === null
        ? (j.gameOverReason as string | null)
        : defaults.gameOverReason,
    victory: typeof j.victory === "boolean" ? j.victory : defaults.victory,
    victoryReason:
      typeof j.victoryReason === "string" || j.victoryReason === null
        ? (j.victoryReason as string | null)
        : defaults.victoryReason,
    nextMeltdownAllowedAfterDay:
      typeof j.nextMeltdownAllowedAfterDay === "number"
        ? j.nextMeltdownAllowedAfterDay
        : defaults.nextMeltdownAllowedAfterDay,
    bodyRepairUsed:
      typeof j.bodyRepairUsed === "boolean"
        ? j.bodyRepairUsed
        : defaults.bodyRepairUsed,
    victoryTargetDay:
      j.victoryTargetDay === 15 || j.victoryTargetDay === 30
        ? (j.victoryTargetDay as VictoryTargetDay)
        : defaults.victoryTargetDay,
    ironman:
      typeof j.ironman === "boolean" ? j.ironman : defaults.ironman,
    creditsWinTarget:
      typeof j.creditsWinTarget === "number" &&
      Number.isFinite(j.creditsWinTarget) &&
      j.creditsWinTarget > 0
        ? j.creditsWinTarget
        : defaults.creditsWinTarget,
  };
}

export function loadGameState(defaults: GameState): GameState {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return mergeLoadedState(JSON.parse(raw), defaults);
  } catch {
    return defaults;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetSave(defaults: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  saveGameState(defaults);
}
