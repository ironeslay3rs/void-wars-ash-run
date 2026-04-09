"use client";

import { AshRunScene } from "@/components/ash-run/AshRunScene";
import { WorldMap } from "@/components/world-map/WorldMap";
import {
  FOLIO_STAGE_ORDER,
  folioMapLabel,
} from "@/features/ash-run/level/catalog";
import {
  applyStageWin,
  loadFolioProgress,
  type FolioProgress,
} from "@/lib/folioProgress";
import { playSfx } from "@/lib/playSfx";
import { useCallback, useEffect, useMemo, useState } from "react";

function defaultProgress(): FolioProgress {
  return {
    unlockedIds: ["blackcity_lab"],
    clearedIds: [],
    clearCountByStage: {},
    bestTimeMsByStage: {},
  };
}

export default function AshRunPage() {
  const [view, setView] = useState<"map" | "play">("map");
  const [levelId, setLevelId] = useState("blackcity_lab");
  const [progress, setProgress] = useState<FolioProgress>(defaultProgress);
  const [mapBanner, setMapBanner] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setProgress(loadFolioProgress());
    });
  }, []);

  const handleStageClear = useCallback(
    (id: string, meta: { timeMs: number }) => {
      const { progress: next, newlyUnlocked, isNewRecord } = applyStageWin(
        id,
        FOLIO_STAGE_ORDER,
        { timeMs: meta.timeMs },
      );
      setProgress(next);
      if (newlyUnlocked.length > 0) {
        playSfx("folio_unlock");
        const names = newlyUnlocked.map((nid) => folioMapLabel(nid));
        setMapBanner(`New folio: ${names.join(" · ")}`);
      }
      if (isNewRecord) {
        playSfx("personal_best");
      }
      return { isNewRecord };
    },
    [],
  );

  const handleBackToMap = useCallback(() => {
    setProgress(loadFolioProgress());
    setView("map");
  }, []);

  const mapKey = useMemo(
    () =>
      `${progress.unlockedIds.join(",")}|${progress.clearedIds.join(",")}|${JSON.stringify(progress.clearCountByStage)}|${JSON.stringify(progress.bestTimeMsByStage)}`,
    [progress],
  );

  return view === "map" ? (
    <WorldMap
      key={mapKey}
      progress={progress}
      banner={mapBanner}
      onDismissBanner={() => setMapBanner(null)}
      onPlay={(id) => {
        setLevelId(id);
        setView("play");
      }}
    />
  ) : (
    <AshRunScene
      key={levelId}
      levelId={levelId}
      personalBestMs={progress.bestTimeMsByStage[levelId] ?? null}
      compact
      onBackToMap={handleBackToMap}
      onStageClear={handleStageClear}
    />
  );
}
