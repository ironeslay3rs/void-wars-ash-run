import type { GameAction } from "@/features/game/gameTypes";

const BTN =
  "rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-left text-sm text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40";

export function PrimaryActions({
  dispatch,
}: {
  dispatch: (a: GameAction) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Actions{" "}
        <span className="font-normal text-zinc-600">· keys 1–4</span>
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className={BTN}
          onClick={() => dispatch({ type: "scavenge" })}
        >
          <span className="font-medium">
            <kbd className="mr-1.5 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              1
            </kbd>
            Scavenge
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            Scrap up · hunger & stress cost
          </span>
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => dispatch({ type: "work" })}
        >
          <span className="font-medium">
            <kbd className="mr-1.5 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              2
            </kbd>
            Work
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            Credits up · costs hunger & stress
          </span>
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => dispatch({ type: "fight" })}
        >
          <span className="font-medium">
            <kbd className="mr-1.5 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              3
            </kbd>
            Fight
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            Risk / reward — win or eat a hit
          </span>
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => dispatch({ type: "rest" })}
        >
          <span className="font-medium">
            <kbd className="mr-1.5 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              4
            </kbd>
            Rest
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            Drop stress · hunger ticks up
          </span>
        </button>
      </div>
    </section>
  );
}
