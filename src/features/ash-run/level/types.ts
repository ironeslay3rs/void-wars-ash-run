import type { PatrolEnemy } from "../entities/types";

export type Rect = { x: number; y: number; w: number; h: number };

export type Solid = Rect & { kind: "solid" };

export type HazardVolume = Rect & {
  kind: "hazard";
  dps: number;
};

export type CheckpointVolume = Rect & { kind: "checkpoint"; id: string };

export type BossGateVolume = Rect & {
  kind: "boss_gate";
  enterLine: string;
};

export type ExitVolume = Rect & { kind: "exit" };

export type LevelEntity =
  | Solid
  | HazardVolume
  | CheckpointVolume
  | BossGateVolume
  | ExitVolume
  | PatrolEnemy;

export type LevelDef = {
  id: string;
  name: string;
  width: number;
  height: number;
  entities: LevelEntity[];
};
