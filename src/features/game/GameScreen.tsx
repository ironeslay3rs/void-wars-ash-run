"use client";

import { FencePanel } from "@/components/game/FencePanel";
import { GameLog } from "@/components/game/GameLog";
import { GameStatsBar } from "@/components/game/GameStatsBar";
import { PrimaryActions } from "@/components/game/PrimaryActions";
import { RunResetRow } from "@/components/game/RunResetRow";
import { ShopAndUpgrades } from "@/components/game/ShopAndUpgrades";
import { useEffect } from "react";
import { useGameEngine } from "./useGameEngine";

export function GameScreen() {
  const { state, dispatch, hardReset } = useGameEngine();

  useEffect(() => {
    if (state.gameOver || state.victory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "1":
          e.preventDefault();
          dispatch({ type: "scavenge" });
          break;
        case "2":
          e.preventDefault();
          dispatch({ type: "work" });
          break;
        case "3":
          e.preventDefault();
          dispatch({ type: "fight" });
          break;
        case "4":
          e.preventDefault();
          dispatch({ type: "rest" });
          break;
        case "5":
          e.preventDefault();
          dispatch({ type: "buy_food" });
          break;
        case "6":
          e.preventDefault();
          dispatch({ type: "buy_medicine" });
          break;
        case "7":
          e.preventDefault();
          dispatch({ type: "sell_scrap" });
          break;
        case "8":
          e.preventDefault();
          dispatch({ type: "buy_intel" });
          break;
        case "9":
          e.preventDefault();
          if (!state.ironman) {
            dispatch({ type: "buy_clinic_repair" });
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.gameOver, state.victory, state.ironman, dispatch]);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-8 text-zinc-100">
      <header className="border-b border-zinc-700/60 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Black Market Survivor
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          One screen, local save — manage health, hunger, stress, credits, and scrap.
        </p>
      </header>

      <GameStatsBar state={state} />

      {state.victory ? (
        <div
          className="rounded-lg border border-emerald-800/60 bg-emerald-950/35 px-4 py-4 text-center"
          role="status"
        >
          <p className="font-medium text-emerald-200">Victory</p>
          <p className="mt-2 text-sm text-emerald-100/85">{state.victoryReason}</p>
          <RunResetRow hardReset={hardReset} variant="panel" />
        </div>
      ) : state.gameOver ? (
        <div
          className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-4 text-center"
          role="alert"
        >
          <p className="font-medium text-red-200">Run ended</p>
          <p className="mt-2 text-sm text-red-200/80">{state.gameOverReason}</p>
          <RunResetRow hardReset={hardReset} variant="panel" />
        </div>
      ) : (
        <>
          <PrimaryActions dispatch={dispatch} />
          <FencePanel state={state} dispatch={dispatch} />
          <ShopAndUpgrades state={state} dispatch={dispatch} />
        </>
      )}

      <GameLog lines={state.log} />

      <footer className="border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500">
        <p className="mb-2">Start fresh (pick run length)</p>
        <RunResetRow hardReset={hardReset} />
      </footer>
    </div>
  );
}
