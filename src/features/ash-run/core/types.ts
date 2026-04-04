import type { Ash, PatrolEnemy } from "../entities/types";
import type { LevelDef } from "../level/types";

export type GamePhase = "playing" | "won" | "dead";

/** Short traversal beat — not a survival event log. */
export type NarrativeBeat = {
  id: string;
  text: string;
  ttlMs: number;
};

export type GameState = {
  level: LevelDef;
  ash: Ash;
  enemies: PatrolEnemy[];
  phase: GamePhase;
  cameraX: number;
  beat: NarrativeBeat | null;
  bossGateTriggered: boolean;
  minibossSpawned: boolean;
  hazardAccMs: number;
};

export type InputBits = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  dash: boolean;
  dashPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  unstable: boolean;
  unstablePressed: boolean;
};
