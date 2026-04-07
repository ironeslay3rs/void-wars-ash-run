import type { TimeShadowState } from "../perception/timeShadowSystem";
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
  /** Ms of sim freeze remaining; decremented by fixed dt, deterministic. */
  hitStopRemainingMs: number;
  /** Recent traces for spatial read (E) — render consumes via getVisibleTimeShadows / getVisibleShadows. */
  timeShadow: TimeShadowState;
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
  /** Read space / time-shadows — Key E (edge + hold). */
  perception: boolean;
  perceptionPressed: boolean;
};
