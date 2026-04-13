/**
 * Rhythm core — Hi-Fi Rush inspired pulse of Ash's Resonance Sight.
 *
 * Mana traces pulse to a territory-specific BPM. On-beat actions earn bonuses
 * (higher jump, dash i-frames, hidden path reveal). Off-beat play is never
 * punished — rhythm is purely additive. Canon: Ash feels the world heartbeat
 * through her Pure heritage (mother's gift). The pulse is the *same faculty*
 * as Resonance Sight, just the audio/temporal dimension of it.
 *
 * Deterministic: derived entirely from `runElapsedMs` + level BPM. No RNG,
 * no audio clock — the sim drives the beat, audio layer follows.
 */

import type { CanonTerritory } from "../level/catalog";

/** Window around beat onset during which an action counts as on-beat. */
export const ON_BEAT_WINDOW_MS = 90;

/** Bonus multipliers — small so off-beat play stays viable. */
export const ON_BEAT_JUMP_VY_MULT = 1.1;
export const ON_BEAT_DASH_IFRAME_MS = 180;

export type RhythmState = {
  /** Beats per minute for this level (territory-driven). */
  bpm: number;
  /** Milliseconds per beat — derived, cached to avoid per-step division. */
  beatPeriodMs: number;
  /**
   * Count of beats that have elapsed since run start. Advanced in step-game
   * when `runElapsedMs` crosses an integer multiple of `beatPeriodMs`.
   */
  beatCount: number;
};

/** Territory → BPM. Black City skews faster and chaotic; Ember Vault slow and resonant. */
export function bpmForTerritory(t: CanonTerritory | null): number {
  switch (t) {
    case "verdant_coil":
      return 108;
    case "chrome_synod":
      return 140;
    case "ember_vault":
      return 96;
    case "blackcity":
      return 128;
    default:
      return 120;
  }
}

export function createRhythmState(bpm: number): RhythmState {
  return {
    bpm,
    beatPeriodMs: 60000 / bpm,
    beatCount: 0,
  };
}

/**
 * Phase within the current beat, in ms (0..beatPeriodMs). Used by render to
 * drive the pulse visual and by gameplay to decide on-beat windows.
 */
export function beatPhaseMs(rhythm: RhythmState, runElapsedMs: number): number {
  const p = runElapsedMs % rhythm.beatPeriodMs;
  return p < 0 ? p + rhythm.beatPeriodMs : p;
}

/**
 * True if `runElapsedMs` is within ±ON_BEAT_WINDOW_MS of a beat onset.
 * Windows straddle the onset from both sides (late-tap AND early-tap read
 * as on-beat — forgiving like Hi-Fi Rush).
 */
export function isOnBeat(
  rhythm: RhythmState,
  runElapsedMs: number,
  windowMs: number = ON_BEAT_WINDOW_MS,
): boolean {
  const phase = beatPhaseMs(rhythm, runElapsedMs);
  return phase <= windowMs || rhythm.beatPeriodMs - phase <= windowMs;
}

/**
 * Advance the integer beat counter based on new elapsed time. Pure function
 * so callers can use it inside a fixed-step sim without mutating global state.
 */
export function advanceRhythm(rhythm: RhythmState, runElapsedMs: number): RhythmState {
  const nextCount = Math.floor(runElapsedMs / rhythm.beatPeriodMs);
  if (nextCount === rhythm.beatCount) return rhythm;
  return { ...rhythm, beatCount: nextCount };
}
