/**
 * Time-shadow — pure logic for Ash’s “read spaces” ability.
 *
 * Lightweight traces only (no replay engine): enemy motion, hazard echoes,
 * and Ash’s recent route for readable path hints. Information-only; combat
 * sim does not consume this data for damage or hitboxes.
 *
 * Integration:
 * - Hold `TimeShadowState` on `GameState` as `timeShadow`.
 * - Each fixed step while playing: `updateTimeShadows(state.timeShadow, state, dtMs)`.
 * - Render (or HUD-free VFX): `getVisibleTimeShadows(state.timeShadow, state)` when perception is active.
 */

import { ashBounds, rectsOverlap } from "../core/collision";
import type { Ash, PatrolEnemy } from "../entities/types";
import type { LevelDef } from "../level/types";
import { isHazard } from "../level/queries";

/* -------------------------------------------------------------------------- */
/* Tunables — short TTL, capped samples, small memory footprint               */
/* -------------------------------------------------------------------------- */

const TRACE_TTL_MS = 4200;
const ASH_SAMPLE_INTERVAL_MS = 64;
const ENEMY_SAMPLE_INTERVAL_MS = 96;
const MAX_ROUTE_HINTS = 48;
const MAX_ENEMY_SAMPLES_PER_ID = 14;
const MAX_HAZARD_ECHOES = 10;
const SUGGESTED_PATH_MAX_POINTS = 24;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Vec2 = { x: number; y: number };

/** Single hazard contact echo (where danger was recently felt). */
export type HazardEchoZone = {
  hazardKey: string;
  x: number;
  y: number;
  tMs: number;
};

/**
 * Mutable shadow buffer — passed by reference from `GameState.timeShadow`.
 *
 * - `routeHints`: recent Ash centers (safe-movement / path polyline source).
 * - `enemyGhostTrails`: per-id ring buffers of enemy centers.
 * - `hazardEchoZones`: short list of recent hazard overlap echoes.
 */
export type TimeShadowState = {
  clockMs: number;
  lastAshSampleClock: number;
  lastEnemySampleClock: Map<string, number>;
  routeHints: Array<{ x: number; y: number; tMs: number }>;
  enemyGhostTrails: Map<string, Array<{ x: number; y: number; tMs: number }>>;
  hazardEchoZones: HazardEchoZone[];
  wasInHazard: boolean;
};

/**
 * Minimal snapshot needed for updates and visibility — any matching object works
 * (e.g. full `GameState` without reading `timeShadow` inside these functions).
 */
export type TimeShadowGameSnapshot = {
  level: LevelDef;
  ash: Ash;
  enemies: PatrolEnemy[];
  phase: "playing" | "won" | "dead";
};

/** Read-only output for callers (render, etc.). */
export type VisibleTimeShadows = {
  active: boolean;
  /** Ash’s recent path (from `routeHints`). */
  ashGhostPath: Vec2[];
  enemyGhostPaths: Map<string, Vec2[]>;
  /** Axis-aligned hints derived from hazard echoes (decay-weighted). */
  dangerHints: Array<{ x: number; y: number; w: number; h: number; intensity: number }>;
  /** Thinned route polyline — “where movement was recently valid”; not a safety guarantee. */
  suggestedPath: Vec2[];
};

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createTimeShadowState(): TimeShadowState {
  return {
    clockMs: 0,
    lastAshSampleClock: -ASH_SAMPLE_INTERVAL_MS,
    lastEnemySampleClock: new Map(),
    routeHints: [],
    enemyGhostTrails: new Map(),
    hazardEchoZones: [],
    wasInHazard: false,
  };
}

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

function pruneByAge<T extends { tMs: number }>(arr: T[], nowClock: number): void {
  const cutoff = nowClock - TRACE_TTL_MS;
  let i = 0;
  while (i < arr.length && arr[i]!.tMs < cutoff) i++;
  if (i > 0) arr.splice(0, i);
}

function hazardKeyForEntityIndex(index: number): string {
  return `hazard:${index}`;
}

function intensityForAge(clockMs: number, tMs: number): number {
  const age = clockMs - tMs;
  if (age >= TRACE_TTL_MS) return 0;
  return 1 - age / TRACE_TTL_MS;
}

function thinPolyline(points: Vec2[], maxPts: number): Vec2[] {
  if (points.length <= maxPts) return points;
  const step = Math.ceil(points.length / maxPts);
  const out: Vec2[] = [];
  for (let i = 0; i < points.length; i += step) out.push(points[i]!);
  if (out[out.length - 1] !== points[points.length - 1]) {
    out.push(points[points.length - 1]!);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* updateTimeShadows — call once per fixed step while `phase === "playing"`   */
/* -------------------------------------------------------------------------- */

/**
 * Records traces from the current world snapshot. Mutates `shadowState` only.
 */
export function updateTimeShadows(
  shadowState: TimeShadowState,
  game: TimeShadowGameSnapshot,
  dtMs: number,
): void {
  if (game.phase !== "playing") return;

  const b = shadowState;
  b.clockMs += dtMs;

  pruneByAge(b.routeHints, b.clockMs);
  for (const [, trail] of b.enemyGhostTrails) pruneByAge(trail, b.clockMs);
  b.hazardEchoZones = b.hazardEchoZones.filter((e) => e.tMs >= b.clockMs - TRACE_TTL_MS);

  const ash = game.ash;
  const ar = ashBounds(ash);

  if (b.clockMs - b.lastAshSampleClock >= ASH_SAMPLE_INTERVAL_MS) {
    b.lastAshSampleClock = b.clockMs;
    const cx = ash.x + ash.width / 2;
    const cy = ash.y + ash.height / 2;
    b.routeHints.push({ x: cx, y: cy, tMs: b.clockMs });
    while (b.routeHints.length > MAX_ROUTE_HINTS) b.routeHints.shift();
  }

  for (const en of game.enemies) {
    const last = b.lastEnemySampleClock.get(en.id) ?? -ENEMY_SAMPLE_INTERVAL_MS;
    if (b.clockMs - last < ENEMY_SAMPLE_INTERVAL_MS) continue;
    b.lastEnemySampleClock.set(en.id, b.clockMs);
    const cx = en.x + en.w / 2;
    const cy = en.y + en.h / 2;
    const trail = b.enemyGhostTrails.get(en.id) ?? [];
    trail.push({ x: cx, y: cy, tMs: b.clockMs });
    while (trail.length > MAX_ENEMY_SAMPLES_PER_ID) trail.shift();
    b.enemyGhostTrails.set(en.id, trail);
  }

  let inHazard = false;
  for (let i = 0; i < game.level.entities.length; i++) {
    const e = game.level.entities[i]!;
    if (!isHazard(e)) continue;
    if (rectsOverlap(ar, e)) {
      inHazard = true;
      b.hazardEchoZones.push({
        hazardKey: hazardKeyForEntityIndex(i),
        x: e.x + e.w / 2,
        y: e.y + e.h / 2,
        tMs: b.clockMs,
      });
      if (b.hazardEchoZones.length > MAX_HAZARD_ECHOES) {
        b.hazardEchoZones.shift();
      }
      break;
    }
  }
  b.wasInHazard = inHazard;
}

/* -------------------------------------------------------------------------- */
/* getVisibleTimeShadows — information-only; gate on Ash perception timers     */
/* -------------------------------------------------------------------------- */

/**
 * Returns shadow data for presentation layers when Pure route-sense or manual
 * spatial read ([E]) is active. No UI or lore here — caller decides drawing.
 */
export function getVisibleTimeShadows(
  shadowState: TimeShadowState,
  game: TimeShadowGameSnapshot,
): VisibleTimeShadows {
  const a = game.ash;
  const active =
    game.phase === "playing" &&
    (a.fusionPureSenseMs > 0 || a.perceptionRemainingMs > 0);

  if (!active) {
    return {
      active: false,
      ashGhostPath: [],
      enemyGhostPaths: new Map(),
      dangerHints: [],
      suggestedPath: [],
    };
  }

  const b = shadowState;
  const ashGhostPath = b.routeHints.map((p) => ({ x: p.x, y: p.y }));

  const enemyGhostPaths = new Map<string, Vec2[]>();
  for (const [id, trail] of b.enemyGhostTrails) {
    enemyGhostPaths.set(
      id,
      trail.map((p) => ({ x: p.x, y: p.y })),
    );
  }

  const dangerHints: VisibleTimeShadows["dangerHints"] = [];
  for (const ev of b.hazardEchoZones) {
    const inten = intensityForAge(b.clockMs, ev.tMs);
    if (inten <= 0) continue;
    dangerHints.push({
      x: ev.x - 14,
      y: ev.y - 10,
      w: 28,
      h: 20,
      intensity: inten * 0.85,
    });
  }

  const suggestedPath = thinPolyline(ashGhostPath, SUGGESTED_PATH_MAX_POINTS);

  return {
    active: true,
    ashGhostPath,
    enemyGhostPaths,
    dangerHints,
    suggestedPath,
  };
}

/* -------------------------------------------------------------------------- */
/* Legacy names — existing ash-run wiring (`GameState.timeShadow`, step-game) */
/* -------------------------------------------------------------------------- */

/** @deprecated Prefer `TimeShadowState` */
export type TimeShadowBuffer = TimeShadowState;

/** @deprecated Prefer `createTimeShadowState` */
export const createTimeShadowBuffer = createTimeShadowState;

export type TimeShadowWorldState = TimeShadowGameSnapshot & {
  timeShadow: TimeShadowState;
};

/** @deprecated Prefer `updateTimeShadows(shadowState, game, dtMs)` */
export function updateTimeShadow(world: TimeShadowWorldState, dtMs: number): void {
  updateTimeShadows(world.timeShadow, world, dtMs);
}

/** @deprecated Prefer `getVisibleTimeShadows(state.timeShadow, state)` */
export function getVisibleShadows(world: TimeShadowWorldState): VisibleTimeShadows {
  return getVisibleTimeShadows(world.timeShadow, world);
}

/** @deprecated Alias of `HazardEchoZone` */
export type HazardShadowEvent = HazardEchoZone;
