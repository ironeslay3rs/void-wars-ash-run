import {
  FENCE_CREDITS_PER_SCRAP,
  FENCE_SCRAP_LOT_MAX,
} from "@/features/game/gameActions";
import type { GameAction, GameState } from "@/features/game/gameTypes";

const BTN =
  "rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-left text-sm text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40";

export function FencePanel({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const lot = Math.min(FENCE_SCRAP_LOT_MAX, state.scrap);
  const canFence =
    lot >= 1 && !state.gameOver && !state.victory;
  const pay = lot * FENCE_CREDITS_PER_SCRAP;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Fence{" "}
        <span className="font-normal text-zinc-600">· key 7 · no day cost</span>
      </h2>
      <button
        type="button"
        className={BTN}
        disabled={!canFence}
        onClick={() => dispatch({ type: "sell_scrap" })}
      >
        <span className="font-medium">
          <kbd className="mr-1.5 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
            7
          </kbd>
          Sell scrap
        </span>
        <span className="mt-0.5 block text-xs text-zinc-400">
          Up to {FENCE_SCRAP_LOT_MAX} scrap → {FENCE_CREDITS_PER_SCRAP} cr each
          {canFence ? ` (${lot} → ${pay} cr)` : ""}
        </span>
      </button>
    </section>
  );
}
