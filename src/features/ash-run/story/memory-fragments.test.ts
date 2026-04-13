import { describe, expect, it } from "vitest";
import {
  FRAGMENTS,
  FULL_MEMORIES,
  fragmentsInZone,
  fullMemoryForZone,
  isFullMemoryUnlocked,
} from "./memory-fragments";

describe("AR-2.6 memory fragments", () => {
  it("every fragment references a zone that has a Full Memory payoff", () => {
    for (const f of FRAGMENTS) {
      const m = fullMemoryForZone(f.zoneId);
      expect(m).not.toBeNull();
    }
  });

  it("Full Memory unlocks only when every fragment in the zone is collected", () => {
    const lab = fragmentsInZone("lab_containment");
    expect(lab.length).toBeGreaterThan(0);

    const collected = new Set<string>();
    expect(isFullMemoryUnlocked("lab_containment", collected)).toBe(false);

    for (const f of lab) collected.add(f.id);
    expect(isFullMemoryUnlocked("lab_containment", collected)).toBe(true);
  });

  it("zone with no fragments reports no unlock (defensive)", () => {
    // iron_sanctum has no seed fragments yet — final zone, nothing to collect.
    expect(isFullMemoryUnlocked("iron_sanctum", new Set())).toBe(false);
  });

  it("ghost_echo fragments require Resonance Sight to surface", () => {
    const sightOnly = FRAGMENTS.filter((f) => f.requiresSight);
    expect(sightOnly.length).toBeGreaterThan(0);
    for (const f of sightOnly) expect(f.kind === "ghost_echo" || f.kind === "iron_trail").toBe(true);
  });

  it("Full Memories cover the full story spine", () => {
    const ids = FULL_MEMORIES.map((m) => m.zoneId);
    expect(ids).toContain("lab_containment");
    expect(ids).toContain("blackcity_outskirts");
    expect(ids).toContain("verdant_coil_entry");
    expect(ids).toContain("chrome_synod_entry");
    expect(ids).toContain("ember_vault_entry");
    expect(ids).toContain("deep_lab_return");
    expect(ids).toContain("iron_sanctum");
  });
});
