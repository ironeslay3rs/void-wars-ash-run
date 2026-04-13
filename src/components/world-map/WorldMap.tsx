"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  folioCanonFocus,
  FOLIO_STAGES,
  introBeatForLevel,
  folioLockHint,
  folioMetaSummary,
  type FolioPlayableId,
} from "@/features/ash-run/level/catalog";
import { formatFolioTime } from "@/lib/format-folio-time";
import type { FolioProgress } from "@/lib/folioProgress";
import { ashRunMapHeaderLine } from "@/lib/canon-lore";

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

  const [selectedId, setSelectedId] = useState<string>(() => {
    const nextReady = nodes.find((n) => n.unlocked && !n.roadmapOnly && !n.cleared);
    if (nextReady) return nextReady.id;
    const lastUnlocked = [...nodes]
      .reverse()
      .find((n) => n.unlocked && !n.roadmapOnly);
    return lastUnlocked?.id ?? nodes[0]?.id ?? "blackcity_lab";
  });

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? nodes[0],
    [nodes, selectedId],
  );

  const move = useCallback(
    (delta: number) => {
      if (nodes.length === 0) return;
      const currentIndex = nodes.findIndex((n) => n.id === selectedId);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const next = (safeIndex + delta + nodes.length) % nodes.length;
      setSelectedId(nodes[next]!.id);
    },
    [nodes, selectedId],
  );

  const launchSelected = useCallback(() => {
    if (!selectedNode) return;
    if (!selectedNode.unlocked || selectedNode.roadmapOnly) return;
    onPlay(selectedNode.id as FolioPlayableId);
  }, [onPlay, selectedNode]);

  useEffect(() => {
    const nav = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;

      if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        move(1);
      }
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        move(-1);
      }
      if (e.code === "Home") {
        e.preventDefault();
        setSelectedId(nodes[0]?.id ?? "blackcity_lab");
      }
      if (e.code === "End") {
        e.preventDefault();
        setSelectedId(nodes[nodes.length - 1]?.id ?? "blackcity_lab");
      }
      if (e.code === "Enter" || e.code === "Space") {
        if (!selectedNode?.unlocked || selectedNode.roadmapOnly) return;
        e.preventDefault();
        launchSelected();
      }
    };

    window.addEventListener("keydown", nav);
    return () => window.removeEventListener("keydown", nav);
  }, [launchSelected, move, nodes, selectedNode]);

  const selectedStatus = useMemo(() => {
    if (!selectedNode) {
      return {
        label: "No folio",
        detail: "No stage is currently selected.",
        tone: "border-zinc-700/70 bg-zinc-950/60 text-zinc-300",
      };
    }
    if (selectedNode.roadmapOnly) {
      return {
        label: "Roadmap",
        detail: "Visible on the board, not playable yet.",
        tone: "border-sky-700/50 bg-sky-950/30 text-sky-200/90",
      };
    }
    if (!selectedNode.unlocked) {
      return {
        label: "Locked",
        detail:
          folioLockHint(selectedNode.id, progress) ?? "Clear the previous folio first.",
        tone: "border-zinc-700/70 bg-zinc-950/60 text-zinc-300",
      };
    }
    if (selectedNode.cleared) {
      return {
        label: selectedNode.clears > 1 ? `Cleared x${selectedNode.clears}` : "Cleared",
        detail: "Replay it for a faster time or a cleaner route.",
        tone: "border-emerald-700/50 bg-emerald-950/30 text-emerald-100/95",
      };
    }
    return {
      label: "Ready",
      detail: "Unlocked and ready for a first clear.",
      tone: "border-amber-500/50 bg-amber-950/35 text-amber-100/95",
    };
  }, [progress, selectedNode]);

  const selectedPreview = useMemo(() => {
    if (!selectedNode) return [];
    return introBeatForLevel(selectedNode.id)
      .text.split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [selectedNode]);

  const selectedCanon = useMemo(
    () => (selectedNode ? folioCanonFocus(selectedNode.id) : null),
    [selectedNode],
  );

  const nextReady = useMemo(
    () => nodes.find((n) => n.unlocked && !n.roadmapOnly && !n.cleared) ?? null,
    [nodes],
  );

  const playableCount = useMemo(
    () => nodes.filter((n) => !n.roadmapOnly).length,
    [nodes],
  );

  const unlockedPlayableCount = useMemo(
    () => nodes.filter((n) => n.unlocked && !n.roadmapOnly).length,
    [nodes],
  );

  const selectedWorldIndex = selectedNode?.index ?? 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4b3420_0%,#252018_38%,#140f0c_100%)] px-4 py-6 text-amber-100/90 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {banner ? (
          <div
            role="status"
            className="flex flex-col gap-2 rounded-xl border border-emerald-700/50 bg-emerald-950/40 px-4 py-3 text-center text-sm text-emerald-100/95 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
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

        <header className="rounded-2xl border border-amber-900/50 bg-[#140f0c]/85 px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <p className="font-serif text-xs font-medium uppercase tracking-[0.28em] text-amber-500/90">
            Oblivion folio board
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-serif text-3xl font-semibold text-[#f5edd8]">
                Choose Ash&apos;s next run
              </h1>
              <p className="mt-2 text-sm leading-6 text-amber-200/78">
                Cleaner stage picking, stronger book identity: Blackcity, the Void,
                and Ash&apos;s Bio/Mecha/Pure survival line stay visible while the board
                keeps the next folio obvious.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-200/55">
                {ashRunMapHeaderLine}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-200/80">
              <span className="rounded-full border border-amber-800/60 bg-amber-950/35 px-3 py-1.5">
                Cleared {progress.clearedIds.length}/{playableCount}
              </span>
              <span className="rounded-full border border-amber-800/60 bg-amber-950/35 px-3 py-1.5">
                Unlocked {unlockedPlayableCount}/{playableCount}
              </span>
              <span className="rounded-full border border-amber-800/60 bg-amber-950/35 px-3 py-1.5">
                Next {nextReady?.mapLabel ?? "PB chase"}
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.95fr)]">
          <section className="rounded-2xl border border-amber-900/50 bg-[#140f0c]/85 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-500/85">
                  Stage board
                </p>
                <p className="mt-1 text-sm text-amber-200/68">
                  Move the cursor in folio order, inspect anything on the path, then
                  launch the selected run from the panel.
                </p>
              </div>
              <p className="text-xs text-amber-200/50">
                Left / Right or A / D to move. Enter or Space to launch.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {nodes.map((n) => {
                const selected = selectedWorldIndex === n.index;
                const locked = !n.unlocked;
                const metaLine = folioMetaSummary(n);
                const statusText = n.roadmapOnly
                  ? "Roadmap"
                  : locked
                    ? "Locked"
                    : n.cleared
                      ? n.clears > 1
                        ? `Clear x${n.clears}`
                        : "Cleared"
                      : "Ready";

                return (
                  <button
                    key={n.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedId(n.id)}
                    className={`group flex min-h-[132px] flex-col rounded-xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-amber-300 bg-amber-950/55 shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_12px_32px_rgba(0,0,0,0.22)]"
                        : locked || n.roadmapOnly
                          ? "border-zinc-700/70 bg-zinc-950/45 text-zinc-300 hover:border-zinc-500/70"
                          : "border-amber-900/45 bg-[#1a1612] hover:border-amber-700/60 hover:bg-[#211a14]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif text-base font-semibold text-[#f5edd8]">
                        {n.mapLabel}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${
                          n.roadmapOnly
                            ? "border-sky-700/50 bg-sky-950/35 text-sky-200/90"
                            : locked
                              ? "border-zinc-700/70 bg-zinc-900/70 text-zinc-300"
                              : n.cleared
                                ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-100/95"
                                : "border-amber-700/50 bg-amber-950/35 text-amber-100/95"
                        }`}
                      >
                        {statusText}
                      </span>
                    </div>
                    <span className="mt-2 text-sm text-amber-100/90">{n.mapSub}</span>
                    {metaLine ? (
                      <span className="mt-1 text-[11px] leading-5 text-amber-200/48">
                        {metaLine}
                      </span>
                    ) : null}
                    {n.bestMs !== undefined && !n.roadmapOnly ? (
                      <span className="mt-auto pt-4 font-mono text-[11px] text-amber-300/72">
                        Best {formatFolioTime(n.bestMs)}
                      </span>
                    ) : (
                      <span className="mt-auto pt-4 text-[11px] text-amber-200/38">
                        {selected ? "Selected" : "Inspect"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="rounded-2xl border border-amber-900/50 bg-[#140f0c]/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
            {selectedNode ? (
              <div className="flex h-full flex-col">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${selectedStatus.tone}`}
                  >
                    {selectedStatus.label}
                  </span>
                  {selectedCanon ? (
                    <span className="rounded-full border border-amber-800/60 bg-amber-950/35 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-200/85">
                      {selectedCanon.label}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-4 font-serif text-3xl font-semibold text-[#f5edd8]">
                  {selectedNode.mapLabel}
                </h2>
                <p className="mt-1 text-base text-amber-100/88">{selectedNode.mapSub}</p>

                <p className="mt-4 rounded-xl border border-amber-900/40 bg-[#1a1612]/75 px-4 py-3 text-sm leading-6 text-amber-200/78">
                  {selectedStatus.detail}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-amber-900/35 bg-[#1a1612]/70 px-3 py-3">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-500/80">
                      Estimated run
                    </dt>
                    <dd className="mt-1 text-amber-100/92">
                      {selectedNode.estMinutes != null
                        ? `~${selectedNode.estMinutes} min`
                        : "Unknown"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-amber-900/35 bg-[#1a1612]/70 px-3 py-3">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-500/80">
                      Route band
                    </dt>
                    <dd className="mt-1 capitalize text-amber-100/92">
                      {selectedNode.difficulty ?? "standard"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-amber-900/35 bg-[#1a1612]/70 px-3 py-3">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-500/80">
                      Clears
                    </dt>
                    <dd className="mt-1 text-amber-100/92">{selectedNode.clears}</dd>
                  </div>
                  <div className="rounded-xl border border-amber-900/35 bg-[#1a1612]/70 px-3 py-3">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-500/80">
                      Personal best
                    </dt>
                    <dd className="mt-1 text-amber-100/92">
                      {selectedNode.bestMs !== undefined
                        ? formatFolioTime(selectedNode.bestMs)
                        : "No clear yet"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-2xl border border-amber-900/35 bg-[#1a1612]/75 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-amber-500/82">
                    Stage preview
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-amber-100/84">
                    {selectedPreview.map((line, index) => (
                      <p key={`${selectedNode.id}-preview-${index}`}>{line}</p>
                    ))}
                  </div>
                </div>

                {selectedCanon ? (
                  <div className="mt-4 rounded-2xl border border-amber-900/35 bg-[#1a1612]/75 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-amber-500/82">
                      Oblivion anchor
                    </p>
                    <p className="mt-3 text-sm leading-6 text-amber-200/74">
                      {selectedCanon.note}
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={launchSelected}
                    disabled={!selectedNode.unlocked || selectedNode.roadmapOnly}
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      !selectedNode.unlocked || selectedNode.roadmapOnly
                        ? "cursor-not-allowed border border-zinc-700/70 bg-zinc-900/60 text-zinc-400"
                        : "border border-amber-400/70 bg-amber-300 text-[#2d200d] hover:bg-amber-200"
                    }`}
                  >
                    {selectedNode.roadmapOnly
                      ? "Roadmap folio"
                      : selectedNode.cleared
                        ? "Replay folio"
                        : "Start folio"}
                  </button>
                  <div className="flex items-center text-xs leading-5 text-amber-200/52">
                    Click any folio to inspect it. Enter starts the selected playable run.
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
