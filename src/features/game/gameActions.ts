import type { GameAction, GameState, UpgradeId } from "./gameTypes";
import {
  fightLossLog,
  fightWinLog,
  restLog,
  scavengeLog,
  workLog,
  pickLine,
} from "./logFlavors";
import { clamp, randomInt } from "./gameUtils";

export const SHOP_FOOD_COST = 14;
export const SHOP_MEDICINE_COST = 22;

/** Fence: sell up to this much scrap per action; does not advance day. */
export const FENCE_SCRAP_LOT_MAX = 5;
export const FENCE_CREDITS_PER_SCRAP = 3;

/** Rumor / intel — flavor hint only; does not change fight RNG. */
export const INTEL_COST = 8;

/** One-time max-HP bump + heal. */
export const CLINIC_REPAIR_COST = 48;
export const CLINIC_REPAIR_HP_BONUS = 5;

/** Heist runs: alternate survivor win when credits ≥ this (day goal still wins too). */
export const HEIST_CREDITS_TARGET = 400;
/** Shorter heist preset — same rules, lower credit bar. */
export const HEIST_CREDITS_LIGHT = 250;
/** Fast heist — lowest credit bar for quick runs. */
export const HEIST_CREDITS_BRISK = 175;

export const UPGRADE_CATALOG: Record<
  UpgradeId,
  { name: string; cost: number; description: string }
> = {
  scavenger_rig: {
    name: "Scavenger rig",
    cost: 55,
    description: "Scavenge finds more scrap (better roll range).",
  },
  brawler_wraps: {
    name: "Brawler wraps",
    cost: 70,
    description: "Taking a fight loss hurts less (−damage floor).",
  },
  nerve_patch: {
    name: "Nerve patch",
    cost: 65,
    description: "Rest shaves extra stress off.",
  },
};

function hasUpgrade(s: GameState, id: UpgradeId): boolean {
  return s.installedUpgrades.includes(id);
}

function appendLog(s: GameState, line: string): GameState {
  const next = [...s.log, line];
  if (next.length > 80) next.splice(0, next.length - 80);
  return { ...s, log: next };
}

function applyVictoryIfEligible(s: GameState): GameState {
  if (s.gameOver || s.victory || s.health <= 0) return s;

  const cw = s.creditsWinTarget;
  if (cw != null && s.credits >= cw) {
    return appendLog(
      {
        ...s,
        victory: true,
        victoryReason: `${cw} credits on the table — even the ledger blinks.`,
      },
      `Victory: heist goal (${cw} cr).`,
    );
  }

  const target = s.victoryTargetDay;
  if (s.day < target) return s;
  const sprint = target === 15;
  return appendLog(
    {
      ...s,
      victory: true,
      victoryReason: sprint
        ? "Fifteen days on the boil — you are still standing."
        : "Thirty days in the grey market — you are still standing.",
    },
    sprint
      ? "Victory: survived the sprint (day 15)."
      : "Victory: survived to day 30.",
  );
}

function checkGameOver(s: GameState): GameState {
  if (s.gameOver) return s;
  if (s.health <= 0) {
    return {
      ...s,
      health: 0,
      gameOver: true,
      gameOverReason: "Health hit zero — the market doesn’t do refunds.",
    };
  }
  return s;
}

function starvationTick(s: GameState): GameState {
  if (s.hunger > 0) return s;
  const dmg = 12;
  return appendLog(
    {
      ...s,
      health: s.health - dmg,
    },
    `Starving: −${dmg} HP (hunger empty).`,
  );
}

/** At 100 stress: punish and reset, with a two-day lockout. */
function maybeStressMeltdown(s: GameState): GameState {
  if (s.stress < 100) return s;
  if (s.day <= s.nextMeltdownAllowedAfterDay) return s;
  const credLoss = Math.max(0, Math.floor(s.credits * 0.25));
  const next: GameState = {
    ...s,
    stress: 38,
    health: s.health - 10,
    credits: Math.max(0, s.credits - credLoss),
    scrap: Math.max(0, s.scrap - 2),
    nextMeltdownAllowedAfterDay: s.day + 2,
  };
  return appendLog(
    next,
    pickLine([
      `Stress snapped: −10 HP, −${credLoss} cr, −2 scrap. Cooldown: two days.`,
      `Meltdown: −10 HP, −${credLoss} cr, −2 scrap. The block looks away for two days.`,
    ]),
  );
}

/**
 * Pure transition. Caller may re-seed RNG in tests by stubbing Math.random.
 */
export function applyGameAction(state: GameState, action: GameAction): GameState {
  if (state.gameOver || state.victory) return state;

  let s = starvationTick(state);
  s = checkGameOver(s);
  if (s.gameOver) return s;

  switch (action.type) {
    case "scavenge": {
      const rig = hasUpgrade(s, "scavenger_rig");
      const found = rig ? randomInt(5, 13) : randomInt(2, 7);
      s = {
        ...s,
        day: s.day + 1,
        scrap: s.scrap + found,
        hunger: clamp(s.hunger - 6, 0, 100),
        stress: clamp(s.stress + 5, 0, 100),
      };
      s = appendLog(s, scavengeLog(found, rig, s.day));
      break;
    }
    case "work": {
      const pay = randomInt(6, 14);
      s = {
        ...s,
        day: s.day + 1,
        credits: s.credits + pay,
        hunger: clamp(s.hunger - 5, 0, 100),
        stress: clamp(s.stress + 7, 0, 100),
      };
      s = appendLog(s, workLog(pay, s.day));
      break;
    }
    case "fight": {
      const win = Math.random() < 0.52;
      s = { ...s, day: s.day + 1 };
      if (win) {
        const bonus = randomInt(4, 10);
        const scrapGain = randomInt(1, 4);
        s = {
          ...s,
          credits: s.credits + bonus,
          scrap: s.scrap + scrapGain,
          stress: clamp(s.stress + 6, 0, 100),
          hunger: clamp(s.hunger - 4, 0, 100),
        };
        s = appendLog(s, fightWinLog(bonus, scrapGain, s.day));
      } else {
        let dmg = randomInt(14, 24);
        const wraps = hasUpgrade(s, "brawler_wraps");
        if (wraps) {
          dmg = Math.max(7, dmg - 8);
        }
        s = {
          ...s,
          health: s.health - dmg,
          stress: clamp(s.stress + 12, 0, 100),
          hunger: clamp(s.hunger - 3, 0, 100),
        };
        s = appendLog(s, fightLossLog(dmg, wraps, s.day));
      }
      break;
    }
    case "rest": {
      const nerve = hasUpgrade(s, "nerve_patch");
      const stressDown = nerve ? 22 : 14;
      s = {
        ...s,
        day: s.day + 1,
        stress: clamp(s.stress - stressDown, 0, 100),
        hunger: clamp(s.hunger + 6, 0, 100),
      };
      s = appendLog(s, restLog(stressDown, nerve, s.day));
      break;
    }
    case "sell_scrap": {
      const lot = Math.min(FENCE_SCRAP_LOT_MAX, s.scrap);
      if (lot < 1) {
        return appendLog(s, "Fence: nothing to unload.");
      }
      const pay = lot * FENCE_CREDITS_PER_SCRAP;
      s = {
        ...s,
        scrap: s.scrap - lot,
        credits: s.credits + pay,
      };
      s = appendLog(
        s,
        `Fence: moved ${lot} scrap for ${pay} cr (no day spent).`,
      );
      break;
    }
    case "buy_intel": {
      const cost = INTEL_COST;
      if (s.credits < cost) {
        return appendLog(s, "Intel: not enough credits.");
      }
      const pct = randomInt(44, 62);
      s = {
        ...s,
        credits: s.credits - cost,
      };
      s = appendLog(
        s,
        `Intel (−${cost} cr): fixer says next fight “feels like ~${pct}%” if you swing today. (Flavor only.)`,
      );
      break;
    }
    case "buy_clinic_repair": {
      if (s.ironman) {
        return appendLog(s, "Clinic: closed — iron run.");
      }
      const cost = CLINIC_REPAIR_COST;
      if (s.bodyRepairUsed) {
        return appendLog(s, "Clinic: body already fully patched once this run.");
      }
      if (s.credits < cost) {
        return appendLog(s, "Clinic: not enough credits for repair.");
      }
      const bonus = CLINIC_REPAIR_HP_BONUS;
      const newMax = s.maxHealth + bonus;
      s = {
        ...s,
        credits: s.credits - cost,
        maxHealth: newMax,
        health: clamp(s.health + bonus, 0, newMax),
        bodyRepairUsed: true,
      };
      s = appendLog(
        s,
        `Clinic: deep repair (−${cost} cr). +${bonus} max HP and heal.`,
      );
      break;
    }
    case "buy_food": {
      const cost = SHOP_FOOD_COST;
      if (s.credits < cost) {
        return appendLog(s, "Shop: not enough credits for food.");
      }
      s = {
        ...s,
        credits: s.credits - cost,
        hunger: clamp(s.hunger + 38, 0, 100),
      };
      s = appendLog(s, `Bought food (−${cost} cr). Hunger up.`);
      break;
    }
    case "buy_medicine": {
      const cost = SHOP_MEDICINE_COST;
      if (s.credits < cost) {
        return appendLog(s, "Shop: not enough credits for medicine.");
      }
      s = {
        ...s,
        credits: s.credits - cost,
        health: clamp(s.health + 32, 0, s.maxHealth),
      };
      s = appendLog(s, `Bought medicine (−${cost} cr). +HP.`);
      break;
    }
    case "buy_upgrade": {
      const id = action.upgradeId;
      const def = UPGRADE_CATALOG[id];
      if (hasUpgrade(s, id)) {
        return appendLog(s, `Install: ${def.name} already owned.`);
      }
      if (s.credits < def.cost) {
        return appendLog(s, `Install: insufficient credits for ${def.name}.`);
      }
      s = {
        ...s,
        credits: s.credits - def.cost,
        installedUpgrades: [...s.installedUpgrades, id],
      };
      s = appendLog(s, `Installed ${def.name} (−${def.cost} cr). ${def.description}`);
      break;
    }
  }

  s = maybeStressMeltdown(s);
  s = checkGameOver(s);
  if (!s.gameOver) {
    s = applyVictoryIfEligible(s);
  }
  return s;
}
