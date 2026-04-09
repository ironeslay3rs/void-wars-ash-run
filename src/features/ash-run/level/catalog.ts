import { createBlackcityLabLevel } from "./blackcity-lab";
import { createFolioFractureLevel } from "./folio-fracture";
import { createFolioClosureLevel } from "./folio-closure";
import { createFolioExileLevel } from "./folio-exile";
import { createFolioEchoLevel } from "./folio-echo";
import { createFolioHorizonLevel } from "./folio-horizon";
import { createFolioReckoningLevel } from "./folio-reckoning";
import { createFolioVergeLevel } from "./folio-verge";
import { createFolioVaultLevel } from "./folio-vault";
import { createFolioAppendixLevel } from "./folio-appendix";
import { createFolioAfterwordLevel } from "./folio-afterword";
import { createFolioIndexLevel } from "./folio-index";
import { createFolioPostscriptLevel } from "./folio-postscript";
import { createFolioCodaLevel } from "./folio-coda";
import { createFolioTerminusLevel } from "./folio-terminus";
import { createFolioZenithLevel } from "./folio-zenith";
import { createTrainingYardLevel } from "./training-yard";
import type { LevelDef } from "./types";

export const DEFAULT_LEVEL_ID = "blackcity_lab";

/** Linear unlock chain: first clear of each id opens the next. */
export const FOLIO_STAGE_ORDER = [
  "blackcity_lab",
  "training_yard",
  "folio_iii_vault",
  "folio_iv_fracture",
  "folio_v_reckoning",
  "folio_vi_closure",
  "folio_vii_exile",
  "folio_viii_horizon",
  "folio_ix_echo",
  "folio_x_verge",
  "folio_xi_zenith",
  "folio_xii_terminus",
  "folio_xiii_coda",
  "folio_xiv_afterword",
  "folio_xv_postscript",
  "folio_xvi_index",
  "folio_xvii_appendix",
] as const;

/** Stages you can actually load into Ash Run (excludes roadmap-only nodes). */
export type FolioPlayableId = (typeof FOLIO_STAGE_ORDER)[number];

export type FolioDifficulty = "tutorial" | "standard" | "challenge";

export type FolioStageMeta = {
  id: string;
  mapLabel: string;
  mapSub: string;
  /** Rough first-run length for the map card. */
  estMinutes?: number;
  /** Band for routing players to the right challenge. */
  difficulty?: FolioDifficulty;
  /** Shown on the map but not playable until a future content drop. */
  roadmapOnly?: boolean;
};

/** Map card subtitle line (time + band). */
export function folioMetaSummary(meta: FolioStageMeta): string | null {
  const bits: string[] = [];
  if (meta.estMinutes != null) {
    bits.push(`~${meta.estMinutes} min`);
  }
  if (meta.difficulty === "tutorial") bits.push("Tutorial");
  else if (meta.difficulty === "standard") bits.push("Standard");
  else if (meta.difficulty === "challenge") bits.push("Challenge");
  return bits.length > 0 ? bits.join(" · ") : null;
}

export const FOLIO_STAGES: readonly FolioStageMeta[] = [
  {
    id: "blackcity_lab",
    mapLabel: "Folio I",
    mapSub: "Blackcity lab",
    estMinutes: 8,
    difficulty: "standard",
  },
  {
    id: "training_yard",
    mapLabel: "Folio II",
    mapSub: "Training yard",
    estMinutes: 3,
    difficulty: "tutorial",
  },
  {
    id: "folio_iii_vault",
    mapLabel: "Folio III",
    mapSub: "Vault arc",
    estMinutes: 12,
    difficulty: "challenge",
  },
  {
    id: "folio_iv_fracture",
    mapLabel: "Folio IV",
    mapSub: "Fracture line",
    estMinutes: 15,
    difficulty: "challenge",
  },
  {
    id: "folio_v_reckoning",
    mapLabel: "Folio V",
    mapSub: "Reckoning",
    estMinutes: 18,
    difficulty: "challenge",
  },
  {
    id: "folio_vi_closure",
    mapLabel: "Folio VI",
    mapSub: "Closure",
    estMinutes: 22,
    difficulty: "challenge",
  },
  {
    id: "folio_vii_exile",
    mapLabel: "Folio VII",
    mapSub: "Exile gate",
    estMinutes: 24,
    difficulty: "challenge",
  },
  {
    id: "folio_viii_horizon",
    mapLabel: "Folio VIII",
    mapSub: "Horizon strip",
    estMinutes: 28,
    difficulty: "challenge",
  },
  {
    id: "folio_ix_echo",
    mapLabel: "Folio IX",
    mapSub: "Echo line",
    estMinutes: 32,
    difficulty: "challenge",
  },
  {
    id: "folio_x_verge",
    mapLabel: "Folio X",
    mapSub: "Verge",
    estMinutes: 36,
    difficulty: "challenge",
  },
  {
    id: "folio_xi_zenith",
    mapLabel: "Folio XI",
    mapSub: "Zenith climb",
    estMinutes: 40,
    difficulty: "challenge",
  },
  {
    id: "folio_xii_terminus",
    mapLabel: "Folio XII",
    mapSub: "Terminus",
    estMinutes: 44,
    difficulty: "challenge",
  },
  {
    id: "folio_xiii_coda",
    mapLabel: "Folio XIII",
    mapSub: "Coda",
    estMinutes: 48,
    difficulty: "challenge",
  },
  {
    id: "folio_xiv_afterword",
    mapLabel: "Folio XIV",
    mapSub: "Afterword",
    estMinutes: 52,
    difficulty: "challenge",
  },
  {
    id: "folio_xv_postscript",
    mapLabel: "Folio XV",
    mapSub: "Postscript",
    estMinutes: 56,
    difficulty: "challenge",
  },
  {
    id: "folio_xvi_index",
    mapLabel: "Folio XVI",
    mapSub: "Index",
    estMinutes: 60,
    difficulty: "challenge",
  },
  {
    id: "folio_xvii_appendix",
    mapLabel: "Folio XVII",
    mapSub: "Appendix",
    estMinutes: 64,
    difficulty: "challenge",
  },
  {
    id: "folio_xviii_colophon",
    mapLabel: "Folio XVIII",
    mapSub: "Colophon (teaser)",
    estMinutes: 68,
    difficulty: "challenge",
    roadmapOnly: true,
  },
];

export function folioMapLabel(stageId: string): string {
  const m = FOLIO_STAGES.find((s) => s.id === stageId);
  return m?.mapLabel ?? stageId;
}

/** Why a node is locked, for helper copy under the card. */
export function folioLockHint(
  stageId: string,
  progress: { unlockedIds: readonly string[] },
): string | null {
  const meta = FOLIO_STAGES.find((s) => s.id === stageId);
  if (!meta) return null;
  if (meta.roadmapOnly) {
    if (meta.id === "folio_xviii_colophon") {
      return "In development — Folio XVII is the latest chapter you can clear today.";
    }
    return "Coming in a future update.";
  }
  if (progress.unlockedIds.includes(stageId)) return null;
  const idx = FOLIO_STAGE_ORDER.indexOf(stageId as FolioPlayableId);
  if (idx <= 0) return null;
  const need = FOLIO_STAGE_ORDER[idx - 1]!;
  const prev = FOLIO_STAGES.find((s) => s.id === need);
  return `Clear ${prev?.mapLabel ?? need} first.`;
}

export function createLevelForId(id: string): LevelDef {
  switch (id) {
    case "blackcity_lab":
      return createBlackcityLabLevel();
    case "training_yard":
      return createTrainingYardLevel();
    case "folio_iii_vault":
      return createFolioVaultLevel();
    case "folio_iv_fracture":
      return createFolioFractureLevel();
    case "folio_v_reckoning":
      return createFolioReckoningLevel();
    case "folio_vi_closure":
      return createFolioClosureLevel();
    case "folio_vii_exile":
      return createFolioExileLevel();
    case "folio_viii_horizon":
      return createFolioHorizonLevel();
    case "folio_ix_echo":
      return createFolioEchoLevel();
    case "folio_x_verge":
      return createFolioVergeLevel();
    case "folio_xi_zenith":
      return createFolioZenithLevel();
    case "folio_xii_terminus":
      return createFolioTerminusLevel();
    case "folio_xiii_coda":
      return createFolioCodaLevel();
    case "folio_xiv_afterword":
      return createFolioAfterwordLevel();
    case "folio_xv_postscript":
      return createFolioPostscriptLevel();
    case "folio_xvi_index":
      return createFolioIndexLevel();
    case "folio_xvii_appendix":
      return createFolioAppendixLevel();
    default:
      return createBlackcityLabLevel();
  }
}

export function introBeatForLevel(id: string): {
  id: string;
  text: string;
  ttlMs: number;
} {
  switch (id) {
    case "training_yard":
      return {
        id: "intro_yard",
        text: "Shorter folio — same rules.\nE reads the floor; the exit is the period at the end.",
        ttlMs: 3000,
      };
    case "folio_iii_vault":
      return {
        id: "intro_vault",
        text: "Deeper ledger — the vault bites back.\nRead the split pools, then answer the warden.",
        ttlMs: 3400,
      };
    case "folio_iv_fracture":
      return {
        id: "intro_fracture",
        text: "Fracture line — the city’s fault written in acid.\nTwo drones, one seal, one herald. Read, then cut.",
        ttlMs: 3600,
      };
    case "folio_v_reckoning":
      return {
        id: "intro_reckoning",
        text: "Reckoning — three drones, one seal, one arbiter.\nIf you can read this far, you already know the rule: E first, feet second.",
        ttlMs: 3800,
      };
    case "folio_vi_closure":
      return {
        id: "intro_closure",
        text: "Closure — four drones on the long desk, then the seal.\nMagistrate only cares whether you finish clean.",
        ttlMs: 4000,
      };
    case "folio_vii_exile":
      return {
        id: "intro_exile",
        text: "Exile gate — five drones, one seal, one keeper.\nPast closure there is only the line.",
        ttlMs: 4200,
      };
    case "folio_viii_horizon":
      return {
        id: "intro_horizon",
        text: "Horizon — six drones, one seal, one sovereign.\nThe gatekeeper was the door; this is the threshold.",
        ttlMs: 4400,
      };
    case "folio_ix_echo":
      return {
        id: "intro_echo",
        text: "Echo line — seven drones, one seal, one custodian.\nThe sovereign saw the edge; the echo names what returns.",
        ttlMs: 4600,
      };
    case "folio_x_verge":
      return {
        id: "intro_verge",
        text: "Verge — eight drones, one seal, one harbinger.\nPast the custodian’s count, the strip names what’s next.",
        ttlMs: 4800,
      };
    case "folio_xi_zenith":
      return {
        id: "intro_zenith",
        text: "Zenith — nine drones, one seal, one exarch.\nThe harbinger warned thin air; the zenith writes the receipt.",
        ttlMs: 5000,
      };
    case "folio_xii_terminus":
      return {
        id: "intro_terminus",
        text: "Terminus — ten drones, one seal, one adjudicator.\nThe exarch judged the climb; the terminus files the case closed.",
        ttlMs: 5200,
      };
    case "folio_xiii_coda":
      return {
        id: "intro_coda",
        text: "Coda — still ten drones—new geometry, same bar.\nTrench, lip, curator: the adjudicator closed the file; you annotate the margin.",
        ttlMs: 5400,
      };
    case "folio_xiv_afterword":
      return {
        id: "intro_afterword",
        text: "Afterword — ten drones again, new argument.\nTwo islands, one gulf, zigzag ink: the curator shelved truth; the scribe wants your footnotes.",
        ttlMs: 5600,
      };
    case "folio_xv_postscript":
      return {
        id: "intro_postscript",
        text: "Postscript — ten drones, three desks, two bridges.\nZipper in, segment out: the scribe wrote margins; the archivist wants the meter.",
        ttlMs: 5800,
      };
    case "folio_xvi_index":
      return {
        id: "intro_index",
        text: "Index — ten drones, stacks and catwalk.\nPostscript metered desks; this chapter sorts you vertically—then the steward closes the volume.",
        ttlMs: 6000,
      };
    case "folio_xvii_appendix":
      return {
        id: "intro_appendix",
        text: "Appendix — ten drones, margins then braid.\nIndex sorted the stacks; this adds ceiling bites, twin spines, and a squeeze—then the binder signs off.",
        ttlMs: 6200,
      };
    default:
      return {
        id: "intro",
        text: "Wrong city, wrong chapter — but the page still turns.\nE reads the ink (traces, hazards). Then run it like a legend.",
        ttlMs: 3200,
      };
  }
}
