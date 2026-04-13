/**
 * AR-2.4 Metroid ability gates — the canonical 7-ability progression.
 *
 * Each ability earned opens new paths in ALL previously visited zones. The
 * ordering below is the canonical story sequence; zones enforce the gate via
 * `Connection.required`.
 *
 *  1. resonance_sight   (start)          basic ghost-trail read
 *  2. echo_dash         (lab escape)     dash through mana-infused thin walls
 *  3. pulse_jump        (Black City)     double jump that pulses hidden platforms
 *  4. soul_anchor       (Verdant Coil)   place & recall checkpoint (Pure ability)
 *  5. frequency_shift   (Chrome Synod)   temporarily shift world BPM
 *  6. resonance_scream  (Ember Vault)    AoE mana burst — breaks corrupted gates
 *  7. void_walk         (endgame)        phase through matter briefly
 *
 * Base movement primitives (wall_jump, dash) are NOT ability-gated — they are
 * Ash's Bio+Mecha heritage kit and active from frame one. Keeping them out of
 * this enum prevents accidental gating of core movement in zone design.
 *
 * Canon: lore-canon/01 Master Canon/Characters/Ash.md (heritage),
 *        lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md.
 */

export type AbilityId =
  | "resonance_sight"
  | "echo_dash"
  | "pulse_jump"
  | "soul_anchor"
  | "frequency_shift"
  | "resonance_scream"
  | "void_walk";

/** Canonical unlock sequence. Index in this array = story order. */
export const ABILITY_ORDER: readonly AbilityId[] = [
  "resonance_sight",
  "echo_dash",
  "pulse_jump",
  "soul_anchor",
  "frequency_shift",
  "resonance_scream",
  "void_walk",
];

export type AbilitySet = ReadonlySet<AbilityId>;

/** Fresh run: only Resonance Sight (awakened at the start of escape). */
export const STARTING_ABILITIES: AbilitySet = new Set<AbilityId>([
  "resonance_sight",
]);

export function hasAbility(set: AbilitySet, id: AbilityId): boolean {
  return set.has(id);
}

export function hasAllAbilities(
  set: AbilitySet,
  required: readonly AbilityId[],
): boolean {
  for (const id of required) {
    if (!set.has(id)) return false;
  }
  return true;
}

export function grantAbility(set: AbilitySet, id: AbilityId): AbilitySet {
  if (set.has(id)) return set;
  const next = new Set(set);
  next.add(id);
  return next;
}

/** Next ability in the canonical chain, or null if Ash has them all. */
export function nextAbilityAfter(set: AbilitySet): AbilityId | null {
  for (const id of ABILITY_ORDER) {
    if (!set.has(id)) return id;
  }
  return null;
}

export function abilityLabel(id: AbilityId): string {
  switch (id) {
    case "resonance_sight":
      return "Resonance Sight";
    case "echo_dash":
      return "Echo Dash";
    case "pulse_jump":
      return "Pulse Jump";
    case "soul_anchor":
      return "Soul Anchor";
    case "frequency_shift":
      return "Frequency Shift";
    case "resonance_scream":
      return "Resonance Scream";
    case "void_walk":
      return "Void Walk";
  }
}

/** Map-friendly hint: how Ash gains this ability (story beat). */
export function abilitySourceHint(id: AbilityId): string {
  switch (id) {
    case "resonance_sight":
      return "Awakened at first containment.";
    case "echo_dash":
      return "Earned in the Lab escape.";
    case "pulse_jump":
      return "Found on the Black City outskirts.";
    case "soul_anchor":
      return "Gifted by Verdant Coil — Pure rite.";
    case "frequency_shift":
      return "Hacked from a Chrome Synod sentinel.";
    case "resonance_scream":
      return "Taught by the Ember Vault sage.";
    case "void_walk":
      return "Claimed from the Void Echo at endgame.";
  }
}
