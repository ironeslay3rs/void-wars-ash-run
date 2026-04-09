"use client";

import { useCallback, useEffect, useState } from "react";
import { applyGameAction } from "./gameActions";
import type { GameAction, GameState, VictoryTargetDay } from "./gameTypes";
import { createInitialGameState } from "./initialGameState";
import { loadGameState, saveGameState } from "./gameUtils";

export function useGameEngine() {
  const [state, setState] = useState<GameState>(() => createInitialGameState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setState(loadGameState(createInitialGameState()));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveGameState(state);
  }, [state, hydrated]);

  const dispatch = useCallback((action: GameAction) => {
    setState((prev) => applyGameAction(prev, action));
  }, []);

  const hardReset = useCallback(
    (
      victoryTargetDay: VictoryTargetDay = 30,
      ironman = false,
      creditsWinTarget: number | null = null,
    ) => {
      const fresh = createInitialGameState(victoryTargetDay, {
        ironman,
        creditsWinTarget,
      });
      setState(fresh);
      saveGameState(fresh);
    },
    [],
  );

  return { state, dispatch, hardReset };
}
