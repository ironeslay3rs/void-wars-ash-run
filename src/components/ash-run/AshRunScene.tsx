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
import { DEFAULT_LEVEL_ID } from "@/features/ash-run/level/catalog";
import {
  createRenderScratch,
  renderGameFrame,
} from "@/features/ash-run/ui/render-frame";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type AshRunSceneProps = {
  levelId?: string;
  /** PB (ms) when the run started — HUD shows pace vs this time (not a replay ghost). */
  personalBestMs?: number | null;
  /** Hide marketing header; show a one-line control hint instead. */
  compact?: boolean;
  onBackToMap?: () => void;
  /**
   * Fires once on win. Return `{ isNewRecord }` so the folio end screen can show PB text.
   */
  onStageClear?: (
    levelId: string,
    meta: { timeMs: number },
  ) => { isNewRecord: boolean } | void;
};

export function AshRunScene({
  levelId = DEFAULT_LEVEL_ID,
  personalBestMs = null,
  compact = false,
  onBackToMap,
  onStageClear,
}: AshRunSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialGameState(levelId));
  const inputRef = useRef<InputBits>(createEmptyInput());
  const renderScratchRef = useRef(createRenderScratch());
  const winNotifiedRef = useRef(false);
  const winHudRef = useRef<{ newRecord: boolean } | null>(null);
  const personalBestRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    personalBestRef.current = personalBestMs ?? null;
  }, [personalBestMs]);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useLayoutEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const resetRun = useCallback(() => {
    winNotifiedRef.current = false;
    winHudRef.current = null;
    setPaused(false);
    stateRef.current = createInitialGameState(levelId);
    inputRef.current = createEmptyInput();
    renderScratchRef.current = createRenderScratch();
  }, [levelId]);

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
    if (!onBackToMap) return;
    const toMap = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code !== "KeyM" && e.code !== "Escape") return;
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      setPaused(false);
      onBackToMap();
    };
    window.addEventListener("keydown", toMap);
    return () => window.removeEventListener("keydown", toMap);
  }, [onBackToMap]);

  useEffect(() => {
    const togglePause = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code !== "KeyP") return;
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      setPaused((p) => !p);
    };
    window.addEventListener("keydown", togglePause);
    return () => window.removeEventListener("keydown", togglePause);
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
      if (!pausedRef.current) {
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
      }

      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (
        stateRef.current.phase === "won" &&
        !winNotifiedRef.current &&
        onStageClear
      ) {
        winNotifiedRef.current = true;
        const fb = onStageClear(levelId, {
          timeMs: stateRef.current.runElapsedMs ?? 0,
        });
        winHudRef.current =
          fb && typeof fb === "object" && fb.isNewRecord
            ? { newRecord: true }
            : null;
      }

      if (ctx) {
        renderGameFrame(
          ctx,
          stateRef.current,
          renderScratchRef.current,
          now,
          rawDt,
          winHudRef.current,
          {
            personalBestMs: personalBestRef.current,
          },
        );
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [syncInputEdgeFlags, levelId, onStageClear]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#252018] p-4 text-amber-100/90">
      {!compact ? (
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
      ) : (
        <p className="max-w-4xl text-center text-xs text-amber-200/55">
          P — pause · M / Esc — folio map · R — restart · move · jump · E read · Z/J · K
          fusion
        </p>
      )}
      <div className="relative inline-block max-w-full">
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
        {paused ? (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-[#0f0d0a]/82 px-4 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="font-serif text-lg font-semibold text-[#f5edd8]">Paused</p>
            <p className="max-w-xs text-xs text-amber-200/80">
              P — resume · M / Esc — folio map
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
