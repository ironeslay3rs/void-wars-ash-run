import type {
  BossGateVolume,
  CheckpointVolume,
  ExitVolume,
  HazardVolume,
  LevelDef,
  LevelEntity,
  ResonanceTraceVolume,
  Solid,
} from "./types";
import type { PatrolEnemy } from "../entities/types";

export function isSolid(e: LevelEntity): e is Solid {
  return e.kind === "solid";
}

export function isHazard(e: LevelEntity): e is HazardVolume {
  return e.kind === "hazard";
}

export function isCheckpoint(e: LevelEntity): e is CheckpointVolume {
  return e.kind === "checkpoint";
}

export function isBossGate(e: LevelEntity): e is BossGateVolume {
  return e.kind === "boss_gate";
}

export function isExit(e: LevelEntity): e is ExitVolume {
  return e.kind === "exit";
}

export function isPatrol(e: LevelEntity): e is PatrolEnemy {
  return e.kind === "patrol";
}

export function isResonanceTrace(e: LevelEntity): e is ResonanceTraceVolume {
  return e.kind === "resonance_trace";
}

export function solidsOf(level: LevelDef): Solid[] {
  return level.entities.filter(isSolid);
}

export function findExit(level: LevelDef): ExitVolume | null {
  return level.entities.find(isExit) ?? null;
}
