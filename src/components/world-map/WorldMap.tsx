"use client";

import type { FolioProgress } from "@/lib/folioProgress";
import { formatFolioTime } from "@/lib/format-folio-time";
import {
  FOLIO_STAGES,
  folioLockHint,
  folioMetaSummary,
  type FolioPlayableId,
} from "@/features/ash-run/level/catalog";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  progress: FolioProgress;
  onPlay: (levelId: FolioPlayableId) => void;
  /** Shown once after returning from a run that unlocked new folios. */
  banner?: string | null;
  onDismissBanner?: () => void;
};

export function WorldMap({
  progress,
  onPlay,
  banner,
  onDismissBanner,
}: Props) {
  const nodes = useMemo(
    () =>
      FOLIO_STAGES.map((s, i) => ({
        ...s,
        unlocked: progress.unlockedIds.includes(s.id),
        cleared: progress.clearedIds.includes(s.id),
        clears: progress.clearCountByStage[s.id] ?? 0,
        bestMs: progress.bestTimeMsByStage[s.id],
        index: i,
      })),
    [progress],
  );

  const playableIndices = useMemo(
    () =>
      nodes
        .map((n, i) => (n.unlocked && !n.roadmapOnly ? i : -1))
        .filter((i) => i >= 0),
    [nodes],
  );

  const [cursorP, setCursorP] = useState(0);
  const safeP = Math.min(cursorP, Math.max(0, playableIndices.length - 1));
  const selectedWorldIndex = playableIndices[safeP] ?? 0;

  const move = useCallback(
    (delta: number) => {
      if (playableIndices.length === 0) return;
      setCursorP((p) => {
        const next = (p + delta + playableIndices.length) % playableIndices.length;
        return next;
      });
    },
    [playableIndices.length],
  );

  useEffect(() => {
    const nav = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        move(1);
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        move(-1);
      }
      if (e.code === "Enter" || e.code === "Space") {
        const w = playableIndices[safeP];
        const n = w !== undefined ? nodes[w] : undefined;
        if (n?.unlocked && !n.roadmapOnly) {
          e.preventDefault();
          onPlay(n.id as FolioPlayableId);
        }
      }
    };
    window.addEventListener("keydown", nav);
    return () => window.removeEventListener("keydown", nav);
  }, [move, nodes, onPlay, playableIndices, safeP]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#252018] p-6 text-amber-100/90">
      {banner ? (
        <div
          role="status"
          className="flex max-w-2xl flex-col gap-2 rounded-lg border border-emerald-700/50 bg-emerald-950/40 px-4 py-3 text-center text-sm text-emerald-100/95 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
        >
          <p>{banner}</p>
          {onDismissBanner ? (
            <button
              type="button"
              className="text-xs text-emerald-300/80 underline decoration-emerald-600/80 underline-offset-2 hover:text-emerald-200"
              onClick={onDismissBanner}
            >
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      <header className="max-w-2xl text-center">
        <p className="font-serif text-xs font-medium uppercase tracking-[0.2em] text-amber-600/90">
          Folio map
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-[#f5edd8]">
          Choose a stage
        </h1>
        <p className="mt-2 text-sm text-amber-200/75">
          Thirty-eight cards — thirty-seven playable through interlude, plus a roadmap teaser
          ahead. Beat each unlocked stage once to open the next; PB chases
          stay open on clears.
        </p>
      </header>

      <div className="flex w-full max-w-3xl flex-wrap items-end justify-center gap-4 md:gap-8">
        {nodes.map((n) => {
          const selected = selectedWorldIndex === n.index;
          const locked = !n.unlocked || n.roadmapOnly;
          const hint = locked ? folioLockHint(n.id, progress) : null;
          const metaLine = folioMetaSummary(n);
          return (
            <button
              key={n.id}
              type="button"
              disabled={locked}
              onClick={() => {
                if (!locked) {
                  const pi = playableIndices.indexOf(n.index);
                  if (pi >= 0) setCursorP(pi);
                  onPlay(n.id as FolioPlayableId);
                }
              }}
              className={`relative flex min-h-[120px] min-w-[140px] flex-col items-center justify-center rounded-lg border-2 px-4 py-5 text-center transition ${
                locked
                  ? "cursor-not-allowed border-zinc-700/80 bg-zinc-900/40 opacity-50"
                  : selected
                    ? "border-amber-400/90 bg-amber-950/50 shadow-[0_0_24px_rgba(251,191,36,0.15)]"
                    : "border-amber-900/50 bg-[#1a1612] hover:border-amber-700/60"
              }`}
            >
              {locked && (
                <span className="absolute right-2 top-2 text-lg text-zinc-500" aria-hidden>
                  🔒
                </span>
              )}
              {n.cleared && !locked && (
                <span className="absolute right-2 top-2 text-xs font-medium text-emerald-500/90">
                  Cleared
                  {n.clears > 1 ? (
                    <span className="ml-1 text-[10px] text-emerald-400/80">
                      ×{n.clears}
                    </span>
                  ) : null}
                </span>
              )}
              <span className="font-serif text-lg font-semibold text-[#f5edd8]">
                {n.mapLabel}
              </span>
              <span className="mt-1 text-xs text-amber-200/60">{n.mapSub}</span>
              {metaLine ? (
                <span className="mt-0.5 text-[10px] text-amber-200/45">
                  {metaLine}
                </span>
              ) : null}
              {n.cleared && !locked && n.bestMs !== undefined ? (
                <span className="mt-1 font-mono text-[10px] text-amber-300/75">
                  Best {formatFolioTime(n.bestMs)}
                </span>
              ) : null}
              {locked && hint ? (
                <span className="mt-2 max-w-[12rem] text-[10px] leading-snug text-zinc-500">
                  {hint}
                </span>
              ) : null}
              {!locked && selected && (
                <span className="mt-3 text-[11px] text-amber-400/90">
                  Enter — start
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="max-w-md text-center text-xs text-amber-200/45">
        ← / → or A / D — move · Enter / Space — enter stage
      </p>
    </div>
  );
}
