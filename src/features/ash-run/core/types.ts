import type { TimeShadowState } from "../perception/timeShadowSystem";
import type { Ash, PatrolEnemy } from "../entities/types";
import type { LevelDef } from "../level/types";
import type { RhythmState } from "./rhythm";

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
  /**
   * In-game time this run: advances by fixed-step dt while playing.
   * Does not advance during hit-stop (freeze frames don’t count).
   */
  runElapsedMs: number;
  /** Recent traces for spatial read (E) — render consumes via getVisibleTimeShadows. */
  timeShadow: TimeShadowState;
  /** True once the perception tutorial beat has been shown (or silenced by an early [E]). */
  perceptionHintShown: boolean;
  /** True once Ash has ever pressed [E] this run — silences the tutorial prompt. */
  perceptionEverUsed: boolean;
  /**
   * World heartbeat — mana traces pulse to a territory-specific BPM. On-beat
   * actions earn bonuses (higher jump, dash i-frames); off-beat is never
   * punished. Canon: Pure heritage lets Ash *feel* the rhythm of the world.
   */
  rhythm: RhythmState;
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
