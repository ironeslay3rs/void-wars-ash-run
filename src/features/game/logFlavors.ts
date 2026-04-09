import { randomInt } from "./gameUtils";

export function pickLine(lines: readonly string[]): string {
  if (lines.length === 0) return "";
  return lines[randomInt(0, lines.length - 1)]!;
}

export function scavengeLog(found: number, rig: boolean, day: number): string {
  const tag = rig ? " (rig)" : "";
  return pickLine([
    `Scavenge: rust and luck. +${found} scrap${tag}. Hunger −6, stress +5. Day ${day}.`,
    `Scavenge: back-alley bins don’t judge. +${found} scrap${tag}. Hunger −6, stress +5. Day ${day}.`,
    `Scavenge: nobody saw the cable. +${found} scrap${tag}. Hunger −6, stress +5. Day ${day}.`,
    `Scavenge: cold hands, warm haul. +${found} scrap${tag}. Hunger −6, stress +5. Day ${day}.`,
  ]);
}

export function workLog(pay: number, day: number): string {
  return pickLine([
    `Work: grey shift paid ${pay} cr. Hunger −5, stress +7. Day ${day}.`,
    `Work: overtime that isn’t on paper. +${pay} cr. Hunger −5, stress +7. Day ${day}.`,
    `Work: loading dock silence. +${pay} cr. Hunger −5, stress +7. Day ${day}.`,
    `Work: cash in an envelope. +${pay} cr. Hunger −5, stress +7. Day ${day}.`,
  ]);
}

export function fightWinLog(
  bonus: number,
  scrapGain: number,
  day: number,
): string {
  return pickLine([
    `Fight: you walked out louder. +${bonus} cr, +${scrapGain} scrap, stress +6. Day ${day}.`,
    `Fight: they didn’t want seconds. +${bonus} cr, +${scrapGain} scrap, stress +6. Day ${day}.`,
    `Fight: win — teeth and tally. +${bonus} cr, +${scrapGain} scrap, stress +6. Day ${day}.`,
  ]);
}

export function fightLossLog(
  dmg: number,
  wraps: boolean,
  day: number,
): string {
  const w = wraps ? " (wraps)" : "";
  return pickLine([
    `Fight: floor met you first. −${dmg} HP${w}, stress +12. Day ${day}.`,
    `Fight: loss — you owe the room. −${dmg} HP${w}, stress +12. Day ${day}.`,
    `Fight: paid in bruises. −${dmg} HP${w}, stress +12. Day ${day}.`,
  ]);
}

export function restLog(stressDown: number, nerve: boolean, day: number): string {
  const tag = nerve ? " (patch)" : "";
  return pickLine([
    `Rest: shallow sleep, deep quiet. Stress −${stressDown}${tag}, hunger +6. Day ${day}.`,
    `Rest: four walls and a door. Stress −${stressDown}${tag}, hunger +6. Day ${day}.`,
    `Rest: you let the noise drain. Stress −${stressDown}${tag}, hunger +6. Day ${day}.`,
  ]);
}
