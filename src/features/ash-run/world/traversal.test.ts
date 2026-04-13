import { describe, expect, it } from "vitest";
import {
  ABILITY_ORDER,
  STARTING_ABILITIES,
  grantAbility,
  nextAbilityAfter,
  type AbilityId,
} from "./abilities";
import { isReachable, missingAbilitiesFor, reachableZones } from "./traversal";

/**
 * Ensures the metroidvania graph respects the canonical 7-ability progression
 * defined in AR-2.4. Fresh runs are Lab-bound; each new ability should open
 * new paths in the existing world.
 */

function withAbilities(extra: AbilityId[]) {
  let set = STARTING_ABILITIES;
  for (const a of extra) set = grantAbility(set, a);
  return set;
}

describe("ability progression", () => {
  it("canonical sequence has exactly seven entries", () => {
    expect(ABILITY_ORDER.length).toBe(7);
  });

  it("fresh run's next ability is echo_dash (first lab escape beat)", () => {
    expect(nextAbilityAfter(STARTING_ABILITIES)).toBe("echo_dash");
  });

  it("advances through the canonical chain as abilities are earned", () => {
    let s = STARTING_ABILITIES;
    const got: (AbilityId | null)[] = [];
    for (let i = 0; i < 8; i++) {
      const next = nextAbilityAfter(s);
      got.push(next);
      if (next) s = grantAbility(s, next);
    }
    expect(got).toEqual([...ABILITY_ORDER.slice(1), null, null]);
  });
});

describe("world graph reachability", () => {
  it("fresh run clears the lab spine, Black City still gated", () => {
    const r = reachableZones("lab_containment", STARTING_ABILITIES);
    // resonance_sight is in STARTING_ABILITIES → lab_deep → lab_hatch opens.
    expect(r.has("lab_containment")).toBe(true);
    expect(r.has("lab_deep")).toBe(true);
    expect(r.has("lab_hatch")).toBe(true);
    // echo_dash is the first *earned* gate — Black City still locked.
    expect(r.has("blackcity_outskirts")).toBe(false);
    expect(r.has("iron_sanctum")).toBe(false);
  });

  it("echo_dash opens the hatch→outskirts passage", () => {
    const abilities = withAbilities(["echo_dash"]);
    expect(
      isReachable("lab_containment", "blackcity_outskirts", abilities),
    ).toBe(true);
  });

  it("pulse_jump opens the Black City market and empire thresholds", () => {
    const abilities = withAbilities(["echo_dash", "pulse_jump"]);
    expect(
      isReachable("lab_containment", "blackcity_market", abilities),
    ).toBe(true);
    // All three empires open at once — Metroid-style any-order branch.
    expect(
      isReachable("lab_containment", "verdant_coil_entry", abilities),
    ).toBe(true);
    expect(
      isReachable("lab_containment", "chrome_synod_entry", abilities),
    ).toBe(true);
    expect(
      isReachable("lab_containment", "ember_vault_entry", abilities),
    ).toBe(true);
  });

  it("deep_lab_return requires all three empire abilities together", () => {
    const partial = withAbilities([
      "echo_dash",
      "pulse_jump",
      "soul_anchor",
      "frequency_shift",
      // missing resonance_scream
    ]);
    expect(
      isReachable("lab_containment", "deep_lab_return", partial),
    ).toBe(false);

    const full = withAbilities([
      "echo_dash",
      "pulse_jump",
      "soul_anchor",
      "frequency_shift",
      "resonance_scream",
    ]);
    expect(isReachable("lab_containment", "deep_lab_return", full)).toBe(true);
  });

  it("iron_sanctum requires void_walk", () => {
    const preFinal = withAbilities([
      "echo_dash",
      "pulse_jump",
      "soul_anchor",
      "frequency_shift",
      "resonance_scream",
    ]);
    expect(isReachable("lab_containment", "iron_sanctum", preFinal)).toBe(false);

    const full = grantAbility(preFinal, "void_walk");
    expect(isReachable("lab_containment", "iron_sanctum", full)).toBe(true);
  });

  it("missingAbilitiesFor points at the specific gate Ash needs next", () => {
    const need = missingAbilitiesFor(
      "lab_containment",
      "blackcity_market",
      STARTING_ABILITIES,
    );
    // Needs both echo_dash (hatch → outskirts) and pulse_jump (outskirts → market).
    expect(need.has("echo_dash")).toBe(true);
    expect(need.has("pulse_jump")).toBe(true);
  });

  it("backtracking: lab zones stay reachable after Ash has escaped", () => {
    const abilities = withAbilities(["echo_dash", "pulse_jump"]);
    const fromMarket = reachableZones("blackcity_market", abilities);
    expect(fromMarket.has("lab_hatch")).toBe(true);
    expect(fromMarket.has("lab_containment")).toBe(true);
  });
});
