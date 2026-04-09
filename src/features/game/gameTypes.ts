export type UpgradeId = "scavenger_rig" | "brawler_wraps" | "nerve_patch";

/** Win when `day` reaches this value (after a day-advancing action). */
export type VictoryTargetDay = 15 | 30;

export type GameState = {
  day: number;
  health: number;
  maxHealth: number;
  /** 0–100; at 0 you take starvation damage on actions. */
  hunger: number;
  /** 0–100 */
  stress: number;
  credits: number;
  scrap: number;
  installedUpgrades: UpgradeId[];
  log: string[];
  gameOver: boolean;
  gameOverReason: string | null;
  /** Survived to day 30+ with health (month on the grey market). */
  victory: boolean;
  victoryReason: string | null;
  /** Run goal: 30 = month, 15 = sprint. */
  victoryTargetDay: VictoryTargetDay;
  /**
   * Stress meltdown cannot fire until `day` is strictly greater than this.
   * After a meltdown, set to `day + 2` to enforce a two-day cooldown.
   */
  nextMeltdownAllowedAfterDay: number;
  /** One-time clinic upgrade to max HP. */
  bodyRepairUsed: boolean;
  /** No clinic repair allowed (iron run). */
  ironman: boolean;
  /**
   * Optional: win immediately when credits reach this value (heist goal).
   * `null` = day-only win. Day target still applies as an alternate win.
   */
  creditsWinTarget: number | null;
};

export type GameAction =
  | { type: "scavenge" }
  | { type: "work" }
  | { type: "fight" }
  | { type: "rest" }
  | { type: "sell_scrap" }
  | { type: "buy_intel" }
  | { type: "buy_clinic_repair" }
  | { type: "buy_food" }
  | { type: "buy_medicine" }
  | { type: "buy_upgrade"; upgradeId: UpgradeId };
