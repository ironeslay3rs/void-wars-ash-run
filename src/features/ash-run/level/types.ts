import type { PatrolEnemy } from "../entities/types";

export type Rect = { x: number; y: number; w: number; h: number };

export type Solid = Rect & { kind: "solid" };

export type HazardVolume = Rect & {
  kind: "hazard";
  dps: number;
  /**
   * When true, a hazard echo zone is seeded at level creation so Resonance Sight
   * surfaces the danger *before* Ash ever touches it. Canon-tied to the Pure
   * school's mana-trace reading: Ash sees traces left by prior victims.
   */
  preEcho?: boolean;
};

export type CheckpointVolume = Rect & { kind: "checkpoint"; id: string };

export type BossGateVolume = Rect & {
  kind: "boss_gate";
  enterLine: string;
};

export type ExitVolume = Rect & { kind: "exit" };

/**
 * Authored Pure-school mana trace left by a prior traveler. Visible only while
 * Resonance Sight is active. Purely informational: no collision, no damage.
 *
 * `kind` selects the semantic stratum:
 *   - "safe_route"    — where movement was valid
 *   - "victim_path"   — where someone met the hazard (warning)
 *   - "patrol_echo"   — where a patrol habitually walks
 *
 * Canon: lore-canon/01 Master Canon/Schools/Pure - Resonance Sight.md §"What it reveals".
 */
export type ResonanceTraceVolume = {
  kind: "resonance_trace";
  x: number;
  y: number;
  traceKind: "safe_route" | "victim_path" | "patrol_echo";
  points: Array<{ x: number; y: number }>;
  /** Optional age falloff hint for render (0..1). */
  intensityFalloff?: number;
};

export type LevelEntity =
  | Solid
  | HazardVolume
  | CheckpointVolume
  | BossGateVolume
  | ExitVolume
  | ResonanceTraceVolume
  | PatrolEnemy;

export type LevelDef = {
  id: string;
  name: string;
  width: number;
  height: number;
  entities: LevelEntity[];
};
