"use client";

import {
  createEmptyInput,
  createInitialGameState,
  FIXED_DT_MS,
  stepGame,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type GameState,
  type InputBits,
} from "@/features/ash-run/core";
import {
  createRenderScratch,
  renderGameFrame,
} from "@/features/ash-run/ui/render-frame";
import { useCallback, useEffect, useRef } from "react";

export function AshRunScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialGameState());
  const inputRef = useRef<InputBits>(createEmptyInput());
  const renderScratchRef = useRef(createRenderScratch());

  const resetRun = useCallback(() => {
    stateRef.current = createInitialGameState();
    inputRef.current = createEmptyInput();
    renderScratchRef.current = createRenderScratch();
  }, []);

  const syncInputEdgeFlags = useCallback(() => {
    const held = inputRef.current;
    inputRef.current = {
      ...held,
      jumpPressed: false,
      dashPressed: false,
      attackPressed: false,
      unstablePressed: false,
      perceptionPressed: false,
    };
  }, []);

  useEffect(() => {
    const restart = (e: KeyboardEvent) => {
      if (e.code !== "KeyR" || e.repeat) return;
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      resetRun();
    };
    window.addEventListener("keydown", restart);
    return () => window.removeEventListener("keydown", restart);
  }, [resetRun]);

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
      if (k === "KeyE") {
        if (!i.perception) i.perceptionPressed = true;
        i.perception = true;
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
      if (k === "KeyE") i.perception = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    canvasRef.current?.focus();
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
      if (ctx) {
        renderGameFrame(
          ctx,
          stateRef.current,
          renderScratchRef.current,
          now,
          rawDt,
        );
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [syncInputEdgeFlags]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#252018] p-4 text-amber-100/90">
      <header className="max-w-4xl text-center">
        <p className="font-serif text-xs font-medium uppercase tracking-[0.2em] text-amber-600/90">
          Chapter I · The borrowed page
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#f5edd8]">
          Void Wars: Ash Run
        </h1>
        <p className="mt-2 text-sm font-medium text-amber-200/85">
          A platform folio — crisp jump-and-run flow, charged burst strikes, and
          a hero who reads the stage like turning a page.
        </p>
        <p className="mt-1.5 text-xs text-amber-200/55">
          Lab escape · move/jump · E turns the page (read) · Z/J strike · K
          fusion · R new run
        </p>
      </header>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="application"
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        className="max-w-full rounded-md border-2 border-amber-900/50 bg-[#1a1612] shadow-[0_16px_48px_rgba(0,0,0,0.55)] outline-none ring-0 focus-visible:ring-2 focus-visible:ring-amber-500/40"
        aria-label="Ash Run: platform jump and run, melee strike, E reads hazards and routes on the stage."
        onPointerDown={(e) => {
          e.currentTarget.focus();
        }}
      />
    </div>
  );
}
