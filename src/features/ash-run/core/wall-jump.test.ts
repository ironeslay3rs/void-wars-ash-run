import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./create-initial-state";
import { createEmptyInput } from "./input";
import { stepGame } from "./step-game";
import {
  FIXED_DT_MS,
  JUMP_VELOCITY,
  VARIABLE_JUMP_RELEASE_FACTOR,
  WALL_JUMP_LOCKOUT_MS,
  WALL_JUMP_POP_SPEED,
  WALL_JUMP_VY_FACTOR,
  WALL_SLIDE_FALL_CAP,
} from "./constants";
import type { GameState } from "./types";
import type { LevelDef } from "../level/types";

/**
 * Wall slide + wall jump + variable jump — deterministic fixed-step tests.
 * Canon: Ash's Bio+Mecha heritage (accelerated body) makes wall kicks feasible
 * pre-awakening. See lore-canon/01 Master Canon/Characters/Ash.md §Heritage.
 */

function makeWallLevel(wallX: number, wallH: number): LevelDef {
  const floorY = 480;
  const W = 1200;
  return {
    id: "wall_test",
    name: "Wall Test",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: 120 },
      { kind: "solid", x: wallX, y: floorY - wallH, w: 32, h: wallH },
      { kind: "exit", x: W - 40, y: floorY - 40, w: 24, h: 40 },
    ],
  };
}

function placeAshNextToWallLeftSide(state: GameState, wallX: number): GameState {
  const s = { ...state };
  const ash = { ...s.ash };
  ash.x = wallX - ash.width - 0.5;
  ash.y = 300;
  ash.vx = 0;
  ash.vy = 0;
  ash.grounded = false;
  return { ...s, ash };
}

describe("wall slide + wall jump + variable jump", () => {
  it("wall slide caps fall speed when pressing into a wall while airborne", () => {
    let s = createInitialGameState();
    s = { ...s, level: makeWallLevel(600, 300) };
    s = placeAshNextToWallLeftSide(s, 600);
    const hold = { ...createEmptyInput(), right: true };
    for (let i = 0; i < 40; i++) s = stepGame(s, hold, FIXED_DT_MS);
    expect(s.ash.wallSlideActive).toBe(true);
    expect(s.ash.vy).toBeLessThanOrEqual(WALL_SLIDE_FALL_CAP + 0.001);
    expect(s.ash.wallContactSide).toBe(1);
  });

  it("wall jump kicks opposite the contact side with canonical impulse", () => {
    let s = createInitialGameState();
    s = { ...s, level: makeWallLevel(600, 300) };
    s = placeAshNextToWallLeftSide(s, 600);
    const hold = { ...createEmptyInput(), right: true };
    for (let i = 0; i < 8; i++) s = stepGame(s, hold, FIXED_DT_MS);
    expect(s.ash.wallContactSide).toBe(1);

    const jumpPress = {
      ...createEmptyInput(),
      right: true,
      jump: true,
      jumpPressed: true,
    };
    s = stepGame(s, jumpPress, FIXED_DT_MS);

    expect(s.ash.vx).toBeLessThan(0);
    expect(Math.abs(s.ash.vx)).toBeCloseTo(WALL_JUMP_POP_SPEED, -1);
    expect(s.ash.vy).toBeLessThan(0);
    expect(s.ash.vy).toBeLessThan(JUMP_VELOCITY * WALL_JUMP_VY_FACTOR + 1);
    expect(s.ash.wallJumpLockoutMs).toBeGreaterThan(0);
    expect(s.ash.wallJumpLockoutMs).toBeLessThanOrEqual(WALL_JUMP_LOCKOUT_MS);
    expect(s.ash.facing).toBe(-1);
  });

  it("variable jump: releasing jump while rising trims vy toward JUMP_VELOCITY * factor", () => {
    let s = createInitialGameState();
    const press = { ...createEmptyInput(), jump: true, jumpPressed: true };
    s = stepGame(s, press, FIXED_DT_MS);
    expect(s.ash.vy).toBeLessThan(0);
    const vyFull = s.ash.vy;

    const release = { ...createEmptyInput() };
    s = stepGame(s, release, FIXED_DT_MS);

    const trimmed = JUMP_VELOCITY * VARIABLE_JUMP_RELEASE_FACTOR;
    expect(s.ash.vy).toBeGreaterThanOrEqual(trimmed - 0.001);
    expect(s.ash.vy).toBeGreaterThan(vyFull);
  });

  it("wall jump lockout prevents an immediate re-stick to the same wall", () => {
    let s = createInitialGameState();
    s = { ...s, level: makeWallLevel(600, 300) };
    s = placeAshNextToWallLeftSide(s, 600);
    const hold = { ...createEmptyInput(), right: true };
    for (let i = 0; i < 8; i++) s = stepGame(s, hold, FIXED_DT_MS);
    const jumpPress = {
      ...createEmptyInput(),
      right: true,
      jump: true,
      jumpPressed: true,
    };
    s = stepGame(s, jumpPress, FIXED_DT_MS);
    expect(s.ash.wallJumpLockoutMs).toBeGreaterThan(0);

    const holdRight = { ...createEmptyInput(), right: true, jump: true };
    s = stepGame(s, holdRight, FIXED_DT_MS);
    expect(s.ash.wallContactSide).toBe(0);
    expect(s.ash.wallSlideActive).toBe(false);
  });
});
