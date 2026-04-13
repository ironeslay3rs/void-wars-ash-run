import { describe, expect, it } from "vitest";
import {
  ASSIST_GRADING_FRAMES,
  DEFAULT_GRADING_FRAMES,
  bonusForGrade,
  gradeAction,
  signedBeatOffsetMs,
} from "./rhythm-grading";
import { createRhythmState } from "./rhythm";
import { FIXED_DT_MS } from "./constants";

/**
 * AR-2.2 grading windows — Perfect/Good/OK/Off at 60 Hz. Grade must be
 * additive only (Off = baseline 1.0, never worse than no-rhythm).
 */

describe("rhythm grading", () => {
  const rhythm = createRhythmState(120); // 500 ms period

  it("signed offset is negative for early, positive for late, bounded half-period", () => {
    expect(signedBeatOffsetMs(rhythm, 10)).toBeCloseTo(10);
    expect(signedBeatOffsetMs(rhythm, 490)).toBeCloseTo(-10);
    expect(signedBeatOffsetMs(rhythm, 250)).toBeCloseTo(250);
  });

  it("default windows: 2/5/8 frames → perfect/good/ok, rest = off", () => {
    // Frame-aligned offsets to the nearest beat onset.
    const oneFrame = FIXED_DT_MS;
    expect(gradeAction(rhythm, oneFrame * 1)).toBe("perfect");
    expect(gradeAction(rhythm, oneFrame * 3)).toBe("good");
    expect(gradeAction(rhythm, oneFrame * 7)).toBe("ok");
    expect(gradeAction(rhythm, oneFrame * 12)).toBe("off");
  });

  it("assist widens perfect window to ±12 frames", () => {
    const off = oneFrameOffset(10);
    expect(gradeAction(rhythm, off, DEFAULT_GRADING_FRAMES)).toBe("off");
    expect(gradeAction(rhythm, off, ASSIST_GRADING_FRAMES)).toBe("perfect");
  });

  it("off-beat bonus is strictly baseline — never punishes", () => {
    const off = bonusForGrade("off");
    expect(off.jumpVyMult).toBe(1);
    expect(off.dashIframeMs).toBe(0);
    expect(off.revealsHiddenPaths).toBe(false);
  });

  it("perfect > good > ok > off — monotonic bonuses", () => {
    const p = bonusForGrade("perfect");
    const g = bonusForGrade("good");
    const o = bonusForGrade("ok");
    const off = bonusForGrade("off");
    expect(p.jumpVyMult).toBeGreaterThan(g.jumpVyMult);
    expect(g.jumpVyMult).toBeGreaterThan(o.jumpVyMult);
    expect(o.jumpVyMult).toBeGreaterThan(off.jumpVyMult);
    expect(p.revealsHiddenPaths).toBe(true);
    expect(g.revealsHiddenPaths).toBe(false);
  });
});

function oneFrameOffset(frames: number): number {
  return frames * FIXED_DT_MS;
}
