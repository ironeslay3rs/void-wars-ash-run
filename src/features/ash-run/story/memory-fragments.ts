/**
 * AR-2.6 Ori-style emotional storytelling via Memory Fragments.
 *
 * Story is entirely opt-in: no forced cutscenes. Fragments are collectibles
 * placed in zones, revealed by exploration or by Resonance Sight ghost echoes.
 * Collecting all fragments in a zone unlocks that zone's "Full Memory" — the
 * emotional reveal for that chapter of Ash's life.
 *
 * Canon locks:
 *  - Mother is Pure school (gifted Ash with Resonance Sight from early age).
 *  - Father is Bio + Mecha hybrid (accelerated her development).
 *  - Iron is the endgame character Ash reaches.
 *  - Ash was taken by a Black City lab; parents followed a false trail.
 *
 * Fragment kinds (per spec):
 *  - ghost_echo    : Resonance Sight reveals a past event as transparent figures
 *  - drawing       : childlike sketch on a wall (pre-capture memory)
 *  - parent_letter : letter / audio log from a parent searching for Ash
 *  - lab_report    : clinical document about Ash's hybrid properties
 *  - iron_trail    : trace of Iron's passage (late zones only)
 */

import type { ZoneId } from "../world/zones";

export type FragmentKind =
  | "ghost_echo"
  | "drawing"
  | "parent_letter"
  | "lab_report"
  | "iron_trail";

export type MemoryFragment = {
  id: string;
  zoneId: ZoneId;
  kind: FragmentKind;
  /** One-line title shown on pickup. Keep terse. */
  title: string;
  /** Body text — the actual lore content the player reads. */
  body: string;
  /** True if the fragment only appears under active Resonance Sight. */
  requiresSight?: boolean;
};

/**
 * Zone "Full Memory" — shown once every fragment in a zone is collected. This
 * is the Ori-style emotional reveal payoff.
 */
export type FullMemory = {
  zoneId: ZoneId;
  title: string;
  body: string;
};

/** Seed fragments for Lab + Black City + empire thresholds. Expandable. */
export const FRAGMENTS: readonly MemoryFragment[] = [
  {
    id: "frag_lab_01",
    zoneId: "lab_containment",
    kind: "drawing",
    title: "Stick-figure family",
    body:
      "Three figures in crayon — mother with a candle-halo, father with a gear-heart, Ash between them. Drawn on the underside of the cot where they couldn't scrub it off.",
  },
  {
    id: "frag_lab_02",
    zoneId: "lab_containment",
    kind: "lab_report",
    title: "Subject 07 — Day 114",
    body:
      "Hybrid markers stable across Bio/Mecha/Pure strata — unprecedented. Pure resonance response anomalously high for pre-adolescent. Recommend accelerated trials.",
  },
  {
    id: "frag_lab_03",
    zoneId: "lab_deep",
    kind: "ghost_echo",
    title: "A hand on the glass",
    body:
      "Resonance Sight picks up a flicker: a tall figure pressing a palm to the pod. You can almost hear a name. She's too young to remember if it's hers.",
    requiresSight: true,
  },
  {
    id: "frag_bc_01",
    zoneId: "blackcity_outskirts",
    kind: "parent_letter",
    title: "Mother's note, torn",
    body:
      "…another false lead. They say another city. Tell yourself she is warm. Tell yourself she is held. I will keep reading the traces until the trace reads back.",
  },
  {
    id: "frag_bc_02",
    zoneId: "blackcity_market",
    kind: "ghost_echo",
    title: "A child runs through",
    body:
      "The market sees a child running the same line every night in ghost-form. It's you, tomorrow, still moving. The resonance hasn't decided which direction time goes.",
    requiresSight: true,
  },
  {
    id: "frag_vc_01",
    zoneId: "verdant_coil_entry",
    kind: "parent_letter",
    title: "Father's log — strained",
    body:
      "Coil elders remember your mother. They say the Pure don't lose their own. I almost believed them. If you find this, trust the drums before you trust the path.",
  },
  {
    id: "frag_cs_01",
    zoneId: "chrome_synod_entry",
    kind: "lab_report",
    title: "Synod intercept, encrypted",
    body:
      "Mecha precision is only strength when paired with Pure tempo. Subject 07 carries both. Suppression protocols insufficient. Escalate to Sentinel 03.",
  },
  {
    id: "frag_ev_01",
    zoneId: "ember_vault_entry",
    kind: "drawing",
    title: "Candle with no mouth",
    body:
      "Etched on the Vault's first pillar: a candle that listens instead of speaking. Ash has seen this shape in her dreams since before the lab.",
  },
  {
    id: "frag_dl_01",
    zoneId: "deep_lab_return",
    kind: "iron_trail",
    title: "Iron passed here",
    body:
      "A bootprint heavier than any Black City guard's. Resonance shows a figure holding the wall, waiting — not for you, but for someone he lost here first.",
    requiresSight: true,
  },
];

export const FULL_MEMORIES: readonly FullMemory[] = [
  {
    zoneId: "lab_containment",
    title: "What they tried to take",
    body:
      "You were eight when they cut the window. You kept the crayons. That's how they couldn't reset you — the drawing remembered first.",
  },
  {
    zoneId: "lab_deep",
    title: "The hand on the glass",
    body:
      "Someone pressed a palm to the pod every shift change. Not a guard. Not a scientist. The resonance remembers the warmth but not the name.",
  },
  {
    zoneId: "lab_hatch",
    title: "The hatch was always unlocked",
    body:
      "The sentinel wasn't the lock — your own permission was. The moment you decided, the door had already decided too.",
  },
  {
    zoneId: "blackcity_market",
    title: "The city agrees to forget you",
    body:
      "Market law: no names, no memory, no record. You pass through and the stalls rearrange behind you. That's how the market keeps anyone alive.",
  },
  {
    zoneId: "blackcity_outskirts",
    title: "The city that didn't know your name",
    body:
      "Black City isn't a home. It's a hinge. It lets you pass because it can't decide whether to keep you.",
  },
  {
    zoneId: "verdant_coil_entry",
    title: "Your mother's rhythm",
    body:
      "The Coil drum is the same tempo as her humming. You recognize it before you remember it.",
  },
  {
    zoneId: "chrome_synod_entry",
    title: "Your father's frame",
    body:
      "The Synod sees perfection and calls it a cage. You see your father's diagrams and call them a way out.",
  },
  {
    zoneId: "ember_vault_entry",
    title: "Your own voice, returned",
    body:
      "The Vault gives you a word you didn't know you'd been missing. Say it on the beat. Something answers.",
  },
  {
    zoneId: "deep_lab_return",
    title: "The truth of the pod",
    body:
      "They weren't trying to break you. They were trying to replicate you. The Void Echo in the corner is the copy that almost worked.",
  },
  {
    zoneId: "iron_sanctum",
    title: "Not alone anymore",
    body:
      "Iron doesn't speak first. He sets the lamp down and waits for the rhythm to match. You sit. Eight years ends here.",
  },
];

export function fragmentsInZone(zone: ZoneId): MemoryFragment[] {
  return FRAGMENTS.filter((f) => f.zoneId === zone);
}

export function fullMemoryForZone(zone: ZoneId): FullMemory | null {
  return FULL_MEMORIES.find((m) => m.zoneId === zone) ?? null;
}

export function isFullMemoryUnlocked(
  zone: ZoneId,
  collectedIds: ReadonlySet<string>,
): boolean {
  const required = fragmentsInZone(zone);
  if (required.length === 0) return false;
  return required.every((f) => collectedIds.has(f.id));
}
