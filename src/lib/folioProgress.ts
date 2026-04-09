import { FOLIO_STAGE_ORDER } from "@/features/ash-run/level/catalog";

/**
 * Persist folio unlocks, clears, per-stage clear counts, and personal-best IGT.
 * v2: clearCountByStage; v1 → v2 migration on first load; best times merge from JSON when present.
 */

export type FolioProgress = {
  unlockedIds: string[];
  clearedIds: string[];
  /** Successful clears per stage, including repeat clears after first beat. */
  clearCountByStage: Record<string, number>;
  /** Fastest IGT clear per stage (ms); lower is better. */
  bestTimeMsByStage: Record<string, number>;
};

const LEGACY_KEY = "void-wars-folio-progress-v1";
const STORAGE_KEY = "void-wars-folio-progress-v2";

const DEFAULT: FolioProgress = {
  unlockedIds: ["blackcity_lab"],
  clearedIds: [],
  clearCountByStage: {},
  bestTimeMsByStage: {},
};

function normalizeCounts(
  clearedIds: string[],
  existing?: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = { ...existing };
  for (const id of clearedIds) {
    if ((out[id] ?? 0) < 1) out[id] = 1;
  }
  return out;
}

function parse(raw: string | null): FolioProgress {
  if (!raw) {
    return {
      unlockedIds: [...DEFAULT.unlockedIds],
      clearedIds: [],
      clearCountByStage: {},
      bestTimeMsByStage: {},
    };
  }
  try {
    const j = JSON.parse(raw) as Partial<FolioProgress>;
    const unlockedIds = Array.isArray(j.unlockedIds)
      ? j.unlockedIds.filter((x) => typeof x === "string")
      : [...DEFAULT.unlockedIds];
    const clearedIds = Array.isArray(j.clearedIds)
      ? j.clearedIds.filter((x) => typeof x === "string")
      : [];
    const clearCountByStage =
      j.clearCountByStage && typeof j.clearCountByStage === "object"
        ? Object.fromEntries(
            Object.entries(j.clearCountByStage).filter(
              ([k, v]) => typeof k === "string" && typeof v === "number",
            ),
          )
        : {};
    const bestTimeMsByStage =
      j.bestTimeMsByStage && typeof j.bestTimeMsByStage === "object"
        ? Object.fromEntries(
            Object.entries(j.bestTimeMsByStage).filter(
              ([k, v]) => typeof k === "string" && typeof v === "number",
            ),
          )
        : {};
    return {
      unlockedIds,
      clearedIds,
      clearCountByStage: normalizeCounts(clearedIds, clearCountByStage),
      bestTimeMsByStage,
    };
  } catch {
    return {
      unlockedIds: [...DEFAULT.unlockedIds],
      clearedIds: [],
      clearCountByStage: {},
      bestTimeMsByStage: {},
    };
  }
}

/** If a stage was cleared, every later stage in the linear path must be unlockable — fixes saves from before a new chapter shipped. */
function repairLinearFolioUnlocks(
  p: FolioProgress,
  orderedIds: readonly string[],
): FolioProgress {
  const unlocked = new Set(p.unlockedIds);
  const cleared = new Set(p.clearedIds);
  let changed = false;
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]!;
    if (!cleared.has(id)) continue;
    if (i + 1 < orderedIds.length) {
      const nxt = orderedIds[i + 1]!;
      if (!unlocked.has(nxt)) {
        unlocked.add(nxt);
        changed = true;
      }
    }
  }
  if (!changed) return p;
  const next = { ...p, unlockedIds: [...unlocked] };
  saveFolioProgress(next);
  return next;
}

function tryMigrateFromV1(): FolioProgress | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(STORAGE_KEY)) return null;
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  const p = parse(raw);
  const next: FolioProgress = {
    ...p,
    clearCountByStage: normalizeCounts(p.clearedIds, p.clearCountByStage),
    bestTimeMsByStage: p.bestTimeMsByStage ?? {},
  };
  saveFolioProgress(next);
  return next;
}

export function loadFolioProgress(): FolioProgress {
  if (typeof window === "undefined") {
    return {
      unlockedIds: [...DEFAULT.unlockedIds],
      clearedIds: [],
      clearCountByStage: {},
      bestTimeMsByStage: {},
    };
  }
  const migrated = tryMigrateFromV1();
  const base =
    migrated !== null ? migrated : parse(localStorage.getItem(STORAGE_KEY));
  return repairLinearFolioUnlocks(base, FOLIO_STAGE_ORDER);
}

export function saveFolioProgress(p: FolioProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      unlockedIds: p.unlockedIds,
      clearedIds: p.clearedIds,
      clearCountByStage: p.clearCountByStage,
      bestTimeMsByStage: p.bestTimeMsByStage,
    }),
  );
}

export type ApplyStageWinResult = {
  progress: FolioProgress;
  /** Stages that became playable for the first time after this win. */
  newlyUnlocked: string[];
  wasFirstClear: boolean;
  /** True when this run’s time beats the stored best for this stage. */
  isNewRecord: boolean;
};

export type ApplyStageWinOptions = {
  /** IGT for this clear; updates personal best when lower than stored (or first time). */
  timeMs?: number;
};

/**
 * Every successful stage clear increments that stage's count.
 * First clear of a stage also unlocks the next id in `orderedIds` (linear folio path).
 */
export function applyStageWin(
  levelId: string,
  orderedIds: readonly string[],
  opts?: ApplyStageWinOptions,
): ApplyStageWinResult {
  const cur = loadFolioProgress();
  const counts = { ...cur.clearCountByStage };
  counts[levelId] = (counts[levelId] ?? 0) + 1;

  const wasFirstClear = !cur.clearedIds.includes(levelId);
  const cleared = new Set(cur.clearedIds);
  const newlyUnlocked: string[] = [];

  if (wasFirstClear) {
    cleared.add(levelId);
    const idx = orderedIds.indexOf(levelId);
    if (idx >= 0 && idx + 1 < orderedIds.length) {
      const nextId = orderedIds[idx + 1]!;
      if (!cur.unlockedIds.includes(nextId)) {
        newlyUnlocked.push(nextId);
      }
    }
  }

  const unlocked = new Set(cur.unlockedIds);
  for (const id of newlyUnlocked) unlocked.add(id);

  const best = { ...(cur.bestTimeMsByStage ?? {}) };
  let isNewRecord = false;
  const t = opts?.timeMs;
  if (t !== undefined && Number.isFinite(t) && t >= 0) {
    const prev = best[levelId];
    if (prev === undefined || t < prev) {
      best[levelId] = t;
      isNewRecord = true;
    }
  }

  const next: FolioProgress = {
    unlockedIds: [...unlocked],
    clearedIds: [...cleared],
    clearCountByStage: counts,
    bestTimeMsByStage: best,
  };
  saveFolioProgress(next);
  return { progress: next, newlyUnlocked, wasFirstClear, isNewRecord };
}

export function isUnlocked(levelId: string): boolean {
  return loadFolioProgress().unlockedIds.includes(levelId);
}
