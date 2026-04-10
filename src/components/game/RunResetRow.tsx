import {
  HEIST_CREDITS_BRISK,
  HEIST_CREDITS_LIGHT,
  HEIST_CREDITS_TARGET,
} from "@/features/game/gameActions";
import type { VictoryTargetDay } from "@/features/game/gameTypes";

const BTN =
  "rounded-md border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-700";

export function RunResetRow({
  hardReset,
  variant = "footer",
}: {
  hardReset: (
    target: VictoryTargetDay,
    ironman?: boolean,
    creditsWinTarget?: number | null,
  ) => void;
  variant?: "footer" | "panel";
}) {
  const wrap =
    variant === "panel"
      ? "mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center"
      : "flex flex-wrap justify-center gap-2";
  const ironWrap =
    variant === "panel"
      ? "mt-2 flex flex-col gap-2 sm:flex-row sm:justify-center"
      : "mt-2 flex flex-wrap justify-center gap-2";
  return (
    <div className="w-full">
      <div className={wrap}>
        <button type="button" className={BTN} onClick={() => hardReset(30, false)}>
          New run · 30 days
        </button>
        <button type="button" className={BTN} onClick={() => hardReset(15, false)}>
          New run · Sprint (15)
        </button>
      </div>
      <p
        className={
          variant === "panel"
            ? "mt-3 text-center text-[10px] text-zinc-500"
            : "mb-1 mt-3 text-center text-[10px] text-zinc-500"
        }
      >
        Iron — no clinic repair (key 9 off)
      </p>
      <div className={ironWrap}>
        <button type="button" className={BTN} onClick={() => hardReset(30, true)}>
          Iron · 30 days
        </button>
        <button type="button" className={BTN} onClick={() => hardReset(15, true)}>
          Iron · Sprint (15)
        </button>
      </div>
      <p
        className={
          variant === "panel"
            ? "mt-3 text-center text-[10px] text-zinc-500"
            : "mb-1 mt-3 text-center text-[10px] text-zinc-500"
        }
      >
        Heist — win at credit goal in hand (or hit day goal)
      </p>
      <p
        className={
          variant === "panel"
            ? "mt-1 text-center text-[10px] text-zinc-500"
            : "mb-1 mt-1 text-center text-[10px] text-zinc-500"
        }
      >
        Standard {HEIST_CREDITS_TARGET} cr · light {HEIST_CREDITS_LIGHT} cr · brisk{" "}
        {HEIST_CREDITS_BRISK} cr
      </p>
      <div className={ironWrap}>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(30, false, HEIST_CREDITS_TARGET)}
        >
          Heist {HEIST_CREDITS_TARGET} · 30d
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(15, false, HEIST_CREDITS_TARGET)}
        >
          Heist {HEIST_CREDITS_TARGET} · Sprint
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(30, true, HEIST_CREDITS_TARGET)}
        >
          Iron heist {HEIST_CREDITS_TARGET} · 30
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(15, true, HEIST_CREDITS_TARGET)}
        >
          Iron heist {HEIST_CREDITS_TARGET} · Sprint
        </button>
      </div>
      <div className={ironWrap}>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(30, false, HEIST_CREDITS_LIGHT)}
        >
          Heist {HEIST_CREDITS_LIGHT} · 30d
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(15, false, HEIST_CREDITS_LIGHT)}
        >
          Heist {HEIST_CREDITS_LIGHT} · Sprint
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(30, true, HEIST_CREDITS_LIGHT)}
        >
          Iron heist {HEIST_CREDITS_LIGHT} · 30
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(15, true, HEIST_CREDITS_LIGHT)}
        >
          Iron heist {HEIST_CREDITS_LIGHT} · Sprint
        </button>
      </div>
      <div className={ironWrap}>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(30, false, HEIST_CREDITS_BRISK)}
        >
          Heist {HEIST_CREDITS_BRISK} · 30d
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(15, false, HEIST_CREDITS_BRISK)}
        >
          Heist {HEIST_CREDITS_BRISK} · Sprint
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(30, true, HEIST_CREDITS_BRISK)}
        >
          Iron heist {HEIST_CREDITS_BRISK} · 30
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => hardReset(15, true, HEIST_CREDITS_BRISK)}
        >
          Iron heist {HEIST_CREDITS_BRISK} · Sprint
        </button>
      </div>
    </div>
  );
}
