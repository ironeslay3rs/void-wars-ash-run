/**
 * Graph traversal helpers for the world map — "what can Ash reach from here
 * with these abilities?" Used by the map UI to dim locked zones and by
 * save/progress logic to decide when new content has opened.
 */

import { type AbilityId, type AbilitySet } from "./abilities";
import {
  CONNECTIONS,
  canTraverse,
  type ZoneId,
  zoneById,
} from "./zones";

/** BFS — all zones reachable from `start` given current abilities. */
export function reachableZones(
  start: ZoneId,
  abilities: AbilitySet,
): ReadonlySet<ZoneId> {
  const seen = new Set<ZoneId>([start]);
  const queue: ZoneId[] = [start];
  while (queue.length > 0) {
    const z = queue.shift()!;
    for (const c of CONNECTIONS) {
      if (!canTraverse(c, abilities)) continue;
      if (c.from === z && !seen.has(c.to)) {
        seen.add(c.to);
        queue.push(c.to);
      } else if (!c.oneWay && c.to === z && !seen.has(c.from)) {
        seen.add(c.from);
        queue.push(c.from);
      }
    }
  }
  return seen;
}

/** True if a path exists from start→goal under the given abilities. */
export function isReachable(
  start: ZoneId,
  goal: ZoneId,
  abilities: AbilitySet,
): boolean {
  return reachableZones(start, abilities).has(goal);
}

/**
 * Which abilities are missing on the shortest locked path from start→goal?
 * Returns the union of `required` over connections that would need to open
 * for goal to become reachable. Empty set = already reachable.
 *
 * Heuristic only — walks the graph ignoring ability checks to find any path,
 * then collects the requirements of that path. Good enough for map hints.
 */
export function missingAbilitiesFor(
  start: ZoneId,
  goal: ZoneId,
  abilities: AbilitySet,
): ReadonlySet<AbilityId> {
  if (isReachable(start, goal, abilities)) return new Set();

  // BFS ignoring ability gates to find a route; track parent edges so we can
  // reconstruct the gate list.
  type Parent = { prev: ZoneId; required: readonly AbilityId[] };
  const parents = new Map<ZoneId, Parent>();
  const seen = new Set<ZoneId>([start]);
  const queue: ZoneId[] = [start];
  while (queue.length > 0) {
    const z = queue.shift()!;
    if (z === goal) break;
    for (const c of CONNECTIONS) {
      if (c.from === z && !seen.has(c.to)) {
        seen.add(c.to);
        parents.set(c.to, { prev: z, required: c.required });
        queue.push(c.to);
      } else if (!c.oneWay && c.to === z && !seen.has(c.from)) {
        seen.add(c.from);
        parents.set(c.from, { prev: z, required: c.required });
        queue.push(c.from);
      }
    }
  }

  if (!parents.has(goal)) {
    // goal is disconnected in the raw graph — unreachable under any kit
    return new Set();
  }

  const needed = new Set<AbilityId>();
  let cursor: ZoneId = goal;
  while (cursor !== start) {
    const p = parents.get(cursor);
    if (!p) break;
    for (const a of p.required) {
      if (!abilities.has(a)) needed.add(a);
    }
    cursor = p.prev;
  }
  return needed;
}

/** Map-friendly zone summary for UI (reachability + label). */
export type ZoneReachability = {
  id: ZoneId;
  name: string;
  reachable: boolean;
};

export function zoneReachabilityFrom(
  start: ZoneId,
  abilities: AbilitySet,
): ZoneReachability[] {
  const reachable = reachableZones(start, abilities);
  return Array.from(reachable).map((id) => ({
    id,
    name: zoneById(id).name,
    reachable: true,
  }));
}
