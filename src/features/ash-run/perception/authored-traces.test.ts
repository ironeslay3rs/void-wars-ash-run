import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../core/create-initial-state";
import { createEmptyInput } from "../core/input";
import { stepGame } from "../core/step-game";
import { FIXED_DT_MS } from "../core/constants";
import {
  createTimeShadowState,
  getVisibleTimeShadows,
  seedLevelPreEchoes,
} from "./timeShadowSystem";
import { isHazard, isResonanceTrace } from "../level/queries";
import type { LevelDef, LevelEntity } from "../level/types";

/**
 * Priority 2 — authored resonance traces + hazard pre-warnings.
 * Canon: lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md §"What it reveals"
 * Resonance Sight reveals three strata; authored traces carry the
 * prior-victim stratum so levels can warn before contact.
 */

describe("hazard pre-echoes + authored resonance traces", () => {
  it("seedLevelPreEchoes populates echoes only for hazards flagged preEcho", () => {
    const level: LevelDef = {
      id: "pre_echo_test",
      name: "Pre-echo test",
      width: 1000,
      height: 600,
      entities: [
        { kind: "solid", x: 0, y: 480, w: 1000, h: 120 },
        { kind: "hazard", x: 200, y: 440, w: 80, h: 40, dps: 1, preEcho: true },
        { kind: "hazard", x: 500, y: 440, w: 80, h: 40, dps: 1 },
      ],
    };
    const t = createTimeShadowState();
    seedLevelPreEchoes(t, level);
    expect(t.hazardEchoZones.length).toBe(1);
    expect(t.hazardEchoZones[0]!.x).toBe(240);
  });

  it("authored traces are hidden while perception is inactive and visible when active", () => {
    const s0 = createInitialGameState("blackcity_lab_hatch");
    const idle = stepGame(s0, createEmptyInput(), FIXED_DT_MS);
    const hidden = getVisibleTimeShadows(idle.timeShadow, idle);
    expect(hidden.active).toBe(false);
    expect(hidden.authoredTraces).toEqual([]);

    const press = {
      ...createEmptyInput(),
      perception: true,
      perceptionPressed: true,
    };
    const reading = stepGame(idle, press, FIXED_DT_MS);
    const visible = getVisibleTimeShadows(reading.timeShadow, reading);
    expect(visible.active).toBe(true);
    expect(visible.authoredTraces.length).toBeGreaterThan(0);
    for (const tr of visible.authoredTraces) {
      expect(["safe_route", "victim_path", "patrol_echo"]).toContain(tr.kind);
      expect(tr.points.length).toBeGreaterThan(1);
    }
  });

  it("hatch beat authors at least one victim-path and one safe-route trace", () => {
    const s = createInitialGameState("blackcity_lab_hatch");
    const kinds = s.level.entities
      .filter(isResonanceTrace)
      .map((t) => t.traceKind);
    expect(kinds).toContain("victim_path");
    expect(kinds).toContain("safe_route");
  });

  it("containment wash hazards both carry preEcho", () => {
    const s = createInitialGameState("blackcity_lab_containment");
    const washHazards = s.level.entities
      .filter(isHazard)
      .filter((h) => h.x >= 900 && h.x <= 1200);
    expect(washHazards.length).toBe(2);
    for (const h of washHazards) expect(h.preEcho).toBe(true);
  });

  it("LevelEntity kinds are exhaustive (compile-time narrowed)", () => {
    const kinds: Array<LevelEntity["kind"]> = [
      "solid",
      "hazard",
      "checkpoint",
      "boss_gate",
      "exit",
      "resonance_trace",
      "patrol",
    ];
    expect(kinds.length).toBe(7);
  });
});
