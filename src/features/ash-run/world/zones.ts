/**
 * World graph — interconnected metroidvania, not a linear folio chain.
 *
 * Each node is a Zone (a navigable region of the world); each edge is a
 * Connection (a physical passage) optionally gated by required abilities.
 * Connections are bidirectional by default — if Ash can pass one way, she
 * can backtrack the same way. One-way connections (one-shot drops, sealed
 * ejections) set `oneWay: true` and flow from `from` to `to` only.
 *
 * This layer is authoring-agnostic: folio scenes in `level/catalog.ts` remain
 * the per-zone playable content. Zones reference a `folioId` so the runtime
 * can load the authored room when Ash enters.
 *
 * Canon lock: Black City is the neutral starting ground; the three empires
 * (Verdant Coil / Chrome Synod / Ember Vault) are ability-gated and any-order.
 * Deep Lab return is endgame content unlocked after all three empires.
 */

import type { CanonTerritory } from "../level/catalog";
import type { AbilityId, AbilitySet } from "./abilities";
import { hasAllAbilities } from "./abilities";

export type ZoneId =
  | "lab_containment"
  | "lab_deep"
  | "lab_hatch"
  | "blackcity_outskirts"
  | "blackcity_market"
  | "verdant_coil_entry"
  | "chrome_synod_entry"
  | "ember_vault_entry"
  | "deep_lab_return"
  | "iron_sanctum";

export type Zone = {
  id: ZoneId;
  name: string;
  territory: CanonTerritory;
  /** Authored folio scene played when Ash enters this zone. */
  folioId: string;
  /** Brief atmosphere hint — shown on the map card. */
  atmosphere: string;
};

export type Connection = {
  from: ZoneId;
  to: ZoneId;
  /** Abilities Ash must hold to traverse this edge. Empty = always open. */
  required: readonly AbilityId[];
  /** If true, only `from → to` is traversable (one-shot drop, sealed gate). */
  oneWay?: boolean;
  /** Flavor label for the map view. */
  label?: string;
};

export const ZONES: readonly Zone[] = [
  {
    id: "lab_containment",
    name: "Lab — Containment",
    territory: "blackcity",
    folioId: "blackcity_lab_containment",
    atmosphere: "Sterile tile. Heartbeat only. The rhythm hasn't found her yet.",
  },
  {
    id: "lab_deep",
    name: "Lab — Deep Shaft",
    territory: "blackcity",
    folioId: "blackcity_lab_deep",
    atmosphere: "Locked braces. Two walls, one kick pattern.",
  },
  {
    id: "lab_hatch",
    name: "Lab — Hatch",
    territory: "blackcity",
    folioId: "blackcity_lab_hatch",
    atmosphere: "Sentinel rouses. First acid trace to read.",
  },
  {
    id: "blackcity_outskirts",
    name: "Black City — Outskirts",
    territory: "blackcity",
    folioId: "training_yard",
    atmosphere: "Open air. The world's pulse, first felt.",
  },
  {
    id: "blackcity_market",
    name: "Black City — Market Spine",
    territory: "blackcity",
    folioId: "folio_iii_vault",
    atmosphere: "Chaotic tempo. Three strains braided on one lane.",
  },
  {
    id: "verdant_coil_entry",
    name: "Verdant Coil — Threshold",
    territory: "verdant_coil",
    folioId: "folio_iv_fracture",
    atmosphere: "Tribal drum under the canopy. Blood-warm stone.",
  },
  {
    id: "chrome_synod_entry",
    name: "Chrome Synod — Threshold",
    territory: "chrome_synod",
    folioId: "folio_v_reckoning",
    atmosphere: "Precision metronome. Light slices along a frame.",
  },
  {
    id: "ember_vault_entry",
    name: "Ember Vault — Threshold",
    territory: "ember_vault",
    folioId: "folio_vi_closure",
    atmosphere: "Choral bass. Soul-deep. The beat lives in the walls.",
  },
  {
    id: "deep_lab_return",
    name: "Deep Lab — Return",
    territory: "blackcity",
    folioId: "folio_x_verge",
    atmosphere: "Old cells, new eyes. Secrets the child missed.",
  },
  {
    id: "iron_sanctum",
    name: "Iron's Sanctum",
    territory: "blackcity",
    folioId: "folio_xi_zenith",
    atmosphere: "Endpage. The protagonist waits where the book closes.",
  },
];

export const CONNECTIONS: readonly Connection[] = [
  // Lab spine — the canonical escape chain. Each step needs a core movement
  // ability; a fresh run always carries the STARTING_ABILITIES set.
  { from: "lab_containment", to: "lab_deep", required: [] },
  { from: "lab_deep", to: "lab_hatch", required: ["resonance_sight"] },
  { from: "lab_hatch", to: "blackcity_outskirts", required: ["echo_dash"] },

  // Black City spine — rhythm is introduced here. The market is the hub: three
  // empire thresholds branch from it in any order once Ash has Pulse Jump.
  { from: "blackcity_outskirts", to: "blackcity_market", required: ["pulse_jump"] },
  {
    from: "blackcity_market",
    to: "verdant_coil_entry",
    required: [],
    label: "Walk the Coil vine-road",
  },
  {
    from: "blackcity_market",
    to: "chrome_synod_entry",
    required: [],
    label: "Cross the Synod gantry",
  },
  {
    from: "blackcity_market",
    to: "ember_vault_entry",
    required: [],
    label: "Take the Vault causeway",
  },

  // Deep Lab return — endgame. Each empire ability opens a hidden stair in
  // Black City; having the full set makes the return passable.
  {
    from: "blackcity_outskirts",
    to: "deep_lab_return",
    required: ["soul_anchor", "frequency_shift", "resonance_scream"],
    label: "Reveal the hidden stair",
  },

  // Iron sanctum — final door. Needs Void Walk (claimed from the Void Echo).
  {
    from: "deep_lab_return",
    to: "iron_sanctum",
    required: ["void_walk"],
    label: "Phase through the last seal",
  },
];

export function zoneById(id: ZoneId): Zone {
  const z = ZONES.find((x) => x.id === id);
  if (!z) throw new Error(`Unknown zone: ${id}`);
  return z;
}

/** Is the connection from→to passable with the given abilities? */
export function canTraverse(conn: Connection, abilities: AbilitySet): boolean {
  return hasAllAbilities(abilities, conn.required);
}

/** All outgoing connections from a zone, filtered by ability set. */
export function openConnectionsFrom(
  zoneId: ZoneId,
  abilities: AbilitySet,
): Connection[] {
  const out: Connection[] = [];
  for (const c of CONNECTIONS) {
    if (c.from === zoneId && canTraverse(c, abilities)) {
      out.push(c);
    } else if (!c.oneWay && c.to === zoneId && canTraverse(c, abilities)) {
      // Reverse edge — bidirectional unless oneWay.
      out.push({ from: c.to, to: c.from, required: c.required, label: c.label });
    }
  }
  return out;
}
