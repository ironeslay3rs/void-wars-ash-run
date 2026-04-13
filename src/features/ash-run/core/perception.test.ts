import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./create-initial-state";
import { createEmptyInput } from "./input";
import { stepGame } from "./step-game";
import {
  FIXED_DT_MS,
  PERCEPTION_READ_COOLDOWN_MS,
  PERCEPTION_READ_DURATION_MS,
} from "./constants";
import { getVisibleTimeShadows } from "../perception/timeShadowSystem";

/**
 * Resonance Sight (Pure school) — [E] Read mode.
 * Canon: lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md
 * - Cooldown'd burst: one edge press opens the window; cooldown begins on close.
 * - Window = PERCEPTION_READ_DURATION_MS; cooldown = PERCEPTION_READ_COOLDOWN_MS.
 * - Time-shadow visibility is active iff the window is open (or Pure fusion).
 */
describe("Resonance Sight [E] — canon-locked", () => {
  it("edge press opens the reading window", () => {
    const s0 = createInitialGameState();
    const press = { ...createEmptyInput(), perception: true, perceptionPressed: true };
    const s1 = stepGame(s0, press, FIXED_DT_MS);
    expect(s1.ash.perceptionRemainingMs).toBeGreaterThan(0);
    expect(s1.ash.perceptionRemainingMs).toBeLessThanOrEqual(PERCEPTION_READ_DURATION_MS);
    expect(s1.ash.perceptionActive).toBe(true);
  });

  it("respects cooldown: second press during cooldown does not reopen the window", () => {
    let s = createInitialGameState();
    const press = { ...createEmptyInput(), perception: true, perceptionPressed: true };
    const held = { ...createEmptyInput() };

    s = stepGame(s, press, FIXED_DT_MS);

    const steps = Math.ceil(PERCEPTION_READ_DURATION_MS / FIXED_DT_MS) + 2;
    for (let i = 0; i < steps; i++) s = stepGame(s, held, FIXED_DT_MS);

    expect(s.ash.perceptionRemainingMs).toBe(0);
    expect(s.ash.perceptionCooldownRemainingMs).toBeGreaterThan(0);

    const s2 = stepGame(s, press, FIXED_DT_MS);
    expect(s2.ash.perceptionRemainingMs).toBe(0);
    expect(s2.ash.perceptionCooldownRemainingMs).toBeGreaterThan(0);
  });

  it("window closes and cooldown drains; new press reopens after full cycle", () => {
    let s = createInitialGameState();
    const press = { ...createEmptyInput(), perception: true, perceptionPressed: true };
    const held = { ...createEmptyInput() };

    s = stepGame(s, press, FIXED_DT_MS);

    const cycleMs = PERCEPTION_READ_DURATION_MS + PERCEPTION_READ_COOLDOWN_MS;
    const steps = Math.ceil(cycleMs / FIXED_DT_MS) + 2;
    for (let i = 0; i < steps; i++) s = stepGame(s, held, FIXED_DT_MS);

    expect(s.ash.perceptionCooldownRemainingMs).toBe(0);

    const s2 = stepGame(s, press, FIXED_DT_MS);
    expect(s2.ash.perceptionRemainingMs).toBeGreaterThan(0);
  });

  it("time-shadow visibility matches the reading window", () => {
    const s0 = createInitialGameState();
    const held = { ...createEmptyInput() };
    const press = { ...createEmptyInput(), perception: true, perceptionPressed: true };

    const idle = stepGame(s0, held, FIXED_DT_MS);
    expect(getVisibleTimeShadows(idle.timeShadow, idle).active).toBe(false);

    const reading = stepGame(idle, press, FIXED_DT_MS);
    expect(getVisibleTimeShadows(reading.timeShadow, reading).active).toBe(true);
  });
});
