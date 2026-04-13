/**
 * AR-2.2 Hi-Fi Rush rhythm engine — input grading.
 *
 * Each action (jump, dash, attack) lands with a grade based on how close it
 * landed to the nearest beat onset. Rhythm is optional for progression; grades
 * drive bonuses for mastery and unlock secrets only.
 *
 * Windows are expressed in frames at 60 Hz (1 frame ≈ 16.67 ms). Assist mode
 * can widen them — see `features/ash-run/assist/assist-mode.ts`.
 *
 * Canon: Ash "feels" the rhythm through Resonance Sight — the Pure school's
 * connection to the world's mana traces pulses as an audio/temporal channel.
 * See lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md.
 */

import { FIXED_DT_MS } from "./constants";
import { beatPhaseMs, type RhythmState } from "./rhythm";

export type RhythmGrade = "perfect" | "good" | "ok" | "off";

export type GradingWindowsFrames = {
  perfect: number;
  good: number;
  ok: number;
};

/** Default Hi-Fi Rush-ish timing windows, in frames at 60 Hz. */
export const DEFAULT_GRADING_FRAMES: GradingWindowsFrames = {
  perfect: 2,
  good: 5,
  ok: 8,
};

/** Assist widens PERFECT out to ±12 frames — see AR-2.3. */
export const ASSIST_GRADING_FRAMES: GradingWindowsFrames = {
  perfect: 12,
  good: 14,
  ok: 16,
};

export type RhythmBonus = {
  /** Jump impulse multiplier (|vy| scaled). 1.5 = +50% for Perfect. */
  jumpVyMult: number;
  /** Extra i-frames on a dash, in ms. */
  dashIframeMs: number;
  /** On this grade, on-beat Resonance Sight reveals hidden paths. */
  revealsHiddenPaths: boolean;
};

/** Grade → bonus. Off-beat is strictly baseline (1×, no i-frames, no reveal). */
export function bonusForGrade(grade: RhythmGrade): RhythmBonus {
  switch (grade) {
    case "perfect":
      return { jumpVyMult: 1.5, dashIframeMs: 240, revealsHiddenPaths: true };
    case "good":
      return { jumpVyMult: 1.25, dashIframeMs: 160, revealsHiddenPaths: false };
    case "ok":
      return { jumpVyMult: 1.1, dashIframeMs: 90, revealsHiddenPaths: false };
    case "off":
      return { jumpVyMult: 1, dashIframeMs: 0, revealsHiddenPaths: false };
  }
}

/**
 * Signed distance (in ms) from runElapsedMs to the nearest beat onset.
 * Range: (-beatPeriod/2, +beatPeriod/2]. Negative = early, positive = late.
 */
export function signedBeatOffsetMs(
  rhythm: RhythmState,
  runElapsedMs: number,
): number {
  const phase = beatPhaseMs(rhythm, runElapsedMs);
  const half = rhythm.beatPeriodMs / 2;
  return phase <= half ? phase : phase - rhythm.beatPeriodMs;
}

/** Grade an action that fires at `runElapsedMs` against `rhythm`. */
export function gradeAction(
  rhythm: RhythmState,
  runElapsedMs: number,
  windows: GradingWindowsFrames = DEFAULT_GRADING_FRAMES,
): RhythmGrade {
  const absOffsetMs = Math.abs(signedBeatOffsetMs(rhythm, runElapsedMs));
  const absOffsetFrames = absOffsetMs / FIXED_DT_MS;
  if (absOffsetFrames <= windows.perfect) return "perfect";
  if (absOffsetFrames <= windows.good) return "good";
  if (absOffsetFrames <= windows.ok) return "ok";
  return "off";
}

/** Short label for HUD flashes ("PERFECT!" / "GOOD" / "OK" / ""). */
export function gradeLabel(grade: RhythmGrade): string {
  switch (grade) {
    case "perfect":
      return "PERFECT!";
    case "good":
      return "GOOD";
    case "ok":
      return "OK";
    case "off":
      return "";
  }
}
