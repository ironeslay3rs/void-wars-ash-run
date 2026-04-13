/**
 * AR-2.3 Celeste-style assist mode.
 *
 * Every toggle is opt-in and STACKS. Enabling assist never locks content, never
 * disables achievements, never hides the death counter. A proud death counter
 * is the opposite of shame — dying is learning.
 *
 * Rank scoring is the one thing assist *does* touch: an S-rank clear requires
 * no assist. D→A ranks are earned freely regardless of assist state, so the
 * story path stays open to every player.
 *
 * Canon anchor: "Ash Marks the Survivor — every wound is a lesson" (Seven Flames).
 */

import type { RhythmGrade } from "../core/rhythm-grading";

export type AssistOptions = {
  /** Playback multiplier on sim dt. 1 = full speed, 0.7 = 70% speed. */
  gameSpeed: 1 | 0.9 | 0.8 | 0.7;
  /** Grant Ash a second air dash before needing to land. */
  extraDash: boolean;
  /** Widen coyote time from 6 frames to 12 frames. */
  extendedCoyote: boolean;
  /** Widen PERFECT timing window (±12 frames instead of ±2). */
  rhythmAssist: boolean;
  /** Story-only invulnerability — hazards/enemies can't kill Ash. */
  invincible: boolean;
};

export const DEFAULT_ASSIST: AssistOptions = {
  gameSpeed: 1,
  extraDash: false,
  extendedCoyote: false,
  rhythmAssist: false,
  invincible: false,
};

export function isAnyAssistOn(a: AssistOptions): boolean {
  return (
    a.gameSpeed !== 1 ||
    a.extraDash ||
    a.extendedCoyote ||
    a.rhythmAssist ||
    a.invincible
  );
}

/* -------------------------------------------------------------------------- */
/* Rank scoring — per-zone D→S based on time, rhythm accuracy, secrets.       */
/* S-rank requires zero-assist + high rhythm accuracy. Lower ranks stay free  */
/* so a story-only player can see credits.                                    */
/* -------------------------------------------------------------------------- */

export type ZoneRank = "D" | "C" | "B" | "A" | "S";

export type ZoneRunStats = {
  /** Final clear time, in ms. */
  timeMs: number;
  /** Designer-authored par time for the zone, in ms. */
  parTimeMs: number;
  /** Count of action grades across the run. Off-beats included. */
  gradeCounts: Record<RhythmGrade, number>;
  /** Secrets / Memory Fragments collected vs total for the zone. */
  secretsFound: number;
  secretsTotal: number;
  /** True if any assist option was on at any point during the clear. */
  anyAssistUsed: boolean;
  /** Death count this run — displayed proudly. */
  deaths: number;
};

/** Fraction of actions graded Good-or-better. Off-beats drag this down. */
export function rhythmAccuracy(stats: ZoneRunStats): number {
  const g = stats.gradeCounts;
  const total = g.perfect + g.good + g.ok + g.off;
  if (total === 0) return 0;
  return (g.perfect + g.good) / total;
}

/** Fraction of secrets collected (0..1). */
export function secretFraction(stats: ZoneRunStats): number {
  if (stats.secretsTotal === 0) return 1;
  return stats.secretsFound / stats.secretsTotal;
}

/** Composite score on 0..1 — used to bucket into a rank. */
export function compositeScore(stats: ZoneRunStats): number {
  const timeScore = Math.min(1, stats.parTimeMs / Math.max(1, stats.timeMs));
  const rhythm = rhythmAccuracy(stats);
  const secrets = secretFraction(stats);
  // Weight: time 40%, rhythm 35%, secrets 25% — matches the brief's priorities.
  return 0.4 * timeScore + 0.35 * rhythm + 0.25 * secrets;
}

/**
 * Map composite score → rank. S gated by no-assist clear (Celeste rule).
 * A rank stays achievable with assist on so story-path players still see
 * healthy feedback.
 */
export function rankFor(stats: ZoneRunStats): ZoneRank {
  const s = compositeScore(stats);
  if (s >= 0.9 && !stats.anyAssistUsed) return "S";
  if (s >= 0.8) return "A";
  if (s >= 0.65) return "B";
  if (s >= 0.45) return "C";
  return "D";
}
