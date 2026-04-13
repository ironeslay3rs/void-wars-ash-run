import { describe, expect, it } from "vitest";
import {
  ON_BEAT_JUMP_VY_MULT,
  ON_BEAT_WINDOW_MS,
  advanceRhythm,
  beatPhaseMs,
  bpmForTerritory,
  createRhythmState,
  isOnBeat,
} from "./rhythm";
import { createInitialGameState } from "./create-initial-state";
import { createEmptyInput } from "./input";
import { stepGame } from "./step-game";
import { FIXED_DT_MS, JUMP_VELOCITY } from "./constants";

/**
 * World heartbeat — deterministic, territory-driven, additive. Off-beat play
 * must never be worse than baseline; on-beat play earns a small edge.
 */

describe("rhythm core", () => {
  it("derives beat period from BPM and clamps phase to [0, period)", () => {
    const r = createRhythmState(120); // 500ms period
    expect(r.beatPeriodMs).toBeCloseTo(500);
    expect(beatPhaseMs(r, 0)).toBe(0);
    expect(beatPhaseMs(r, 250)).toBeCloseTo(250);
    expect(beatPhaseMs(r, 500)).toBeCloseTo(0);
    expect(beatPhaseMs(r, 1250)).toBeCloseTo(250);
  });

  it("reports on-beat in a symmetric window around each onset", () => {
    const r = createRhythmState(120);
    expect(isOnBeat(r, 0)).toBe(true);
    expect(isOnBeat(r, ON_BEAT_WINDOW_MS - 1)).toBe(true);
    expect(isOnBeat(r, 500 - ON_BEAT_WINDOW_MS + 1)).toBe(true);
    expect(isOnBeat(r, 250)).toBe(false);
  });

  it("advanceRhythm counts integer beats past without mutating input", () => {
    const r = createRhythmState(120);
    const r2 = advanceRhythm(r, 1500);
    expect(r.beatCount).toBe(0);
    expect(r2.beatCount).toBe(3);
  });

  it("picks territory-distinct tempos (Pure slow, Mecha fast)", () => {
    expect(bpmForTerritory("ember_vault")).toBeLessThan(
      bpmForTerritory("chrome_synod"),
    );
    expect(bpmForTerritory("blackcity")).toBeGreaterThan(
      bpmForTerritory("verdant_coil"),
    );
  });
});

describe("on-beat bonus wiring", () => {
  it("on-beat jump pops higher than off-beat jump (additive only)", () => {
    // Force a level whose beat period is a clean multiple of FIXED_DT_MS so
    // we can deterministically place the press on and off a beat onset.
    const base = createInitialGameState();
    // Use a long beat period (1s) so the off-beat window is unambiguous.
    const onBeatState = {
      ...base,
      rhythm: { bpm: 60, beatPeriodMs: 1000, beatCount: 0 },
    };
    const offBeatState = {
      ...base,
      rhythm: { bpm: 60, beatPeriodMs: 1000, beatCount: 0 },
      runElapsedMs: 500, // middle of beat — far outside ±90ms window
    };
    const press = { ...createEmptyInput(), jump: true, jumpPressed: true };
    const onBeat = stepGame(onBeatState, press, FIXED_DT_MS);
    const offBeat = stepGame(offBeatState, press, FIXED_DT_MS);

    // on-beat jump is *more negative* (higher) than off-beat
    expect(onBeat.ash.vy).toBeLessThan(offBeat.ash.vy);
    expect(onBeat.ash.vy).toBeLessThanOrEqual(
      JUMP_VELOCITY * ON_BEAT_JUMP_VY_MULT + 0.5,
    );
  });
});
