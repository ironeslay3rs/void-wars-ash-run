"use client";

import {
  createInitialGameState,
  FIXED_DT_MS,
  stepGame,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type GameState,
  type InputBits,
} from "@/features/ash-run/core";
import { createEmptyInput } from "@/features/ash-run/ui/input";
import { renderGameFrame } from "@/features/ash-run/ui/render-frame";
import { useCallback, useEffect, useRef } from "react";

export function AshRunScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialGameState());
  const inputRef = useRef<InputBits>(createEmptyInput());

  const syncInputEdgeFlags = useCallback(() => {
    const held = inputRef.current;
    inputRef.current = {
      ...held,
      jumpPressed: false,
      dashPressed: false,
      attackPressed: false,
      unstablePressed: false,
    };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.code;
      const i = inputRef.current;
      if (k === "ArrowLeft" || k === "KeyA") i.left = true;
      if (k === "ArrowRight" || k === "KeyD") i.right = true;
      if (k === "ArrowUp" || k === "KeyW" || k === "Space") {
        if (!i.jump) i.jumpPressed = true;
        i.jump = true;
      }
      if (k === "ShiftLeft" || k === "ShiftRight") {
        if (!i.dash) i.dashPressed = true;
        i.dash = true;
      }
      if (k === "KeyZ" || k === "KeyJ") {
        if (!i.attack) i.attackPressed = true;
        i.attack = true;
      }
      if (k === "KeyK") {
        if (!i.unstable) i.unstablePressed = true;
        i.unstable = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.code;
      const i = inputRef.current;
      if (k === "ArrowLeft" || k === "KeyA") i.left = false;
      if (k === "ArrowRight" || k === "KeyD") i.right = false;
      if (k === "ArrowUp" || k === "KeyW" || k === "Space") i.jump = false;
      if (k === "ShiftLeft" || k === "ShiftRight") i.dash = false;
      if (k === "KeyZ" || k === "KeyJ") i.attack = false;
      if (k === "KeyK") i.unstable = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const frame = (now: number) => {
      const rawDt = now - last;
      last = now;
      acc += Math.min(rawDt, 100);

      while (acc >= FIXED_DT_MS) {
        stateRef.current = stepGame(
          stateRef.current,
          { ...inputRef.current },
          FIXED_DT_MS,
        );
        syncInputEdgeFlags();
        acc -= FIXED_DT_MS;
      }

      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (ctx) renderGameFrame(ctx, stateRef.current);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [syncInputEdgeFlags]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-zinc-950 p-4 text-zinc-200">
      <header className="max-w-4xl text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Void Wars: Ash Run
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Blackcity Lab Escape — vertical slice. Move: A/D or arrows · Jump:
          Space · Dash: Shift · Strike: Z/J · Unstable fusion: K
        </p>
      </header>
      <canvas
        ref={canvasRef}
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        className="max-w-full rounded-lg border border-zinc-700 bg-black shadow-lg"
        aria-label="Ash Run gameplay canvas"
      />
    </div>
  );
}
