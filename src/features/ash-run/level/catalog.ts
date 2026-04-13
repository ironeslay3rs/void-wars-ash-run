import { createBlackcityLabLevel } from "./blackcity-lab";
import { createFolioFractureLevel } from "./folio-fracture";
import { createFolioClosureLevel } from "./folio-closure";
import { createFolioExileLevel } from "./folio-exile";
import { createFolioEchoLevel } from "./folio-echo";
import { createFolioEpilogueLevel } from "./folio-epilogue";
import { createFolioHorizonLevel } from "./folio-horizon";
import { createFolioReckoningLevel } from "./folio-reckoning";
import { createFolioVergeLevel } from "./folio-verge";
import { createFolioVaultLevel } from "./folio-vault";
import { createFolioAppendixLevel } from "./folio-appendix";
import { createFolioAfterlineLevel } from "./folio-afterline";
import { createFolioVellumLevel } from "./folio-vellum";
import { createFolioEndpaperLevel } from "./folio-endpaper";
import { createFolioFlyleafLevel } from "./folio-flyleaf";
import { createFolioHalftitleLevel } from "./folio-halftitle";
import { createFolioFrontispieceLevel } from "./folio-frontispiece";
import { createFolioCopyrightLevel } from "./folio-copyright";
import { createFolioDedicationLevel } from "./folio-dedication";
import { createFolioEpigraphPageLevel } from "./folio-epigraph-page";
import { createFolioForewordLevel } from "./folio-foreword";
import { createFolioPrefaceLevel } from "./folio-preface";
import { createFolioIntroductionLevel } from "./folio-introduction";
import { createFolioBodyMatterLevel } from "./folio-body";
import { createFolioIncipitLevel } from "./folio-incipit";
import { createFolioChapterLevel } from "./folio-chapter";
import { createFolioInterludeLevel } from "./folio-interlude";
import { createFolioTitlepageLevel } from "./folio-titlepage";
import { createFolioAfterwordLevel } from "./folio-afterword";
import { createFolioIndexLevel } from "./folio-index";
import { createFolioPostscriptLevel } from "./folio-postscript";
import { createFolioCodaLevel } from "./folio-coda";
import { createFolioCodexLevel } from "./folio-codex";
import { createFolioColophonLevel } from "./folio-colophon";
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
  "folio_xviii_colophon",
  "folio_xix_epilogue",
  "folio_xx_codex",
  "folio_xxi_afterline",
  "folio_xxii_vellum",
  "folio_xxiii_endpaper",
  "folio_xxiv_flyleaf",
  "folio_xxv_halftitle",
  "folio_xxvi_frontispiece",
  "folio_xxvii_titlepage",
  "folio_xxviii_copyright",
  "folio_xxix_dedication",
  "folio_xxx_epigraph",
  "folio_xxxi_foreword",
  "folio_xxxii_preface",
  "folio_xxxiii_introduction",
  "folio_xxxiv_body",
  "folio_xxxv_incipit",
  "folio_xxxvi_chapter",
  "folio_xxxvii_interlude",
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

export type FolioCanonFocus = {
  label: string;
  note: string;
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
    mapSub: "Colophon",
    estMinutes: 68,
    difficulty: "challenge",
  },
  {
    id: "folio_xix_epilogue",
    mapLabel: "Folio XIX",
    mapSub: "Epilogue",
    estMinutes: 72,
    difficulty: "challenge",
  },
  {
    id: "folio_xx_codex",
    mapLabel: "Folio XX",
    mapSub: "Codex",
    estMinutes: 76,
    difficulty: "challenge",
  },
  {
    id: "folio_xxi_afterline",
    mapLabel: "Folio XXI",
    mapSub: "Afterline",
    estMinutes: 80,
    difficulty: "challenge",
  },
  {
    id: "folio_xxii_vellum",
    mapLabel: "Folio XXII",
    mapSub: "Vellum",
    estMinutes: 84,
    difficulty: "challenge",
  },
  {
    id: "folio_xxiii_endpaper",
    mapLabel: "Folio XXIII",
    mapSub: "Endpaper",
    estMinutes: 88,
    difficulty: "challenge",
  },
  {
    id: "folio_xxiv_flyleaf",
    mapLabel: "Folio XXIV",
    mapSub: "Flyleaf",
    estMinutes: 92,
    difficulty: "challenge",
  },
  {
    id: "folio_xxv_halftitle",
    mapLabel: "Folio XXV",
    mapSub: "Halftitle",
    estMinutes: 96,
    difficulty: "challenge",
  },
  {
    id: "folio_xxvi_frontispiece",
    mapLabel: "Folio XXVI",
    mapSub: "Frontispiece",
    estMinutes: 100,
    difficulty: "challenge",
  },
  {
    id: "folio_xxvii_titlepage",
    mapLabel: "Folio XXVII",
    mapSub: "Title page",
    estMinutes: 104,
    difficulty: "challenge",
  },
  {
    id: "folio_xxviii_copyright",
    mapLabel: "Folio XXVIII",
    mapSub: "Copyright",
    estMinutes: 108,
    difficulty: "challenge",
  },
  {
    id: "folio_xxix_dedication",
    mapLabel: "Folio XXIX",
    mapSub: "Dedication",
    estMinutes: 112,
    difficulty: "challenge",
  },
  {
    id: "folio_xxx_epigraph",
    mapLabel: "Folio XXX",
    mapSub: "Epigraph",
    estMinutes: 116,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxi_foreword",
    mapLabel: "Folio XXXI",
    mapSub: "Foreword",
    estMinutes: 120,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxii_preface",
    mapLabel: "Folio XXXII",
    mapSub: "Preface",
    estMinutes: 124,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxiii_introduction",
    mapLabel: "Folio XXXIII",
    mapSub: "Introduction",
    estMinutes: 128,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxiv_body",
    mapLabel: "Folio XXXIV",
    mapSub: "Body matter",
    estMinutes: 132,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxv_incipit",
    mapLabel: "Folio XXXV",
    mapSub: "Incipit",
    estMinutes: 136,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxvi_chapter",
    mapLabel: "Folio XXXVI",
    mapSub: "Chapter",
    estMinutes: 140,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxvii_interlude",
    mapLabel: "Folio XXXVII",
    mapSub: "Interlude",
    estMinutes: 144,
    difficulty: "challenge",
  },
  {
    id: "folio_xxxviii_postlude",
    mapLabel: "Folio XXXVIII",
    mapSub: "Postlude (teaser)",
    estMinutes: 148,
    difficulty: "challenge",
    roadmapOnly: true,
  },
];

export function folioMapLabel(stageId: string): string {
  const m = FOLIO_STAGES.find((s) => s.id === stageId);
  return m?.mapLabel ?? stageId;
}

/**
 * Map-facing canon anchors inferred from the local vault's Black Market, Void,
 * and Three Schools notes so the board feels tied to Oblivion without inventing
 * a separate full lore sheet for every folio.
 */
export function folioCanonFocus(stageId: string): FolioCanonFocus {
  const meta = FOLIO_STAGES.find((s) => s.id === stageId);
  if (meta?.roadmapOnly) {
    return {
      label: "Roadmap signal",
      note:
        "This folio keeps the route visible on the board, but the next playable Oblivion slice has not shipped yet.",
    };
  }

  const idx = FOLIO_STAGE_ORDER.indexOf(stageId as FolioPlayableId);
  if (idx <= 1) {
    return {
      label: "Blackcity breach",
      note:
        "Ash starts where the Black Market fuses strains — not pure Bio, Mecha, or Pure, but a little of everything. The opening board favors clean routing over exposition.",
    };
  }
  if (idx <= 11) {
    return {
      label: "Void pressure",
      note:
        "The Void reads as exile and forced adaptation: treat the route like a law you learn once, then stop second-guessing under pressure.",
    };
  }
  if (idx <= 23) {
    return {
      label: "Mixed evolution",
      note:
        "Mid-folios lean into the Market’s identity: trade, corruption, and adaptation intersect — Bio, Mecha, and Pure survival lines braided on one lane.",
    };
  }
  return {
    label: "Oblivion margin",
    note:
      "Late folios stress memory, law, and endurance — closer to the saga’s wider Oblivion tone across the seven-book spine.",
  };
}

/** Why a node is locked, for helper copy under the card. */
export function folioLockHint(
  stageId: string,
  progress: { unlockedIds: readonly string[] },
): string | null {
  const meta = FOLIO_STAGES.find((s) => s.id === stageId);
  if (!meta) return null;
  if (meta.roadmapOnly) {
    if (meta.id === "folio_xxxviii_postlude") {
      return "In development — Folio XXXVII is the latest chapter you can clear today.";
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
    case "folio_xviii_colophon":
      return createFolioColophonLevel();
    case "folio_xix_epilogue":
      return createFolioEpilogueLevel();
    case "folio_xx_codex":
      return createFolioCodexLevel();
    case "folio_xxi_afterline":
      return createFolioAfterlineLevel();
    case "folio_xxii_vellum":
      return createFolioVellumLevel();
    case "folio_xxiii_endpaper":
      return createFolioEndpaperLevel();
    case "folio_xxiv_flyleaf":
      return createFolioFlyleafLevel();
    case "folio_xxv_halftitle":
      return createFolioHalftitleLevel();
    case "folio_xxvi_frontispiece":
      return createFolioFrontispieceLevel();
    case "folio_xxvii_titlepage":
      return createFolioTitlepageLevel();
    case "folio_xxviii_copyright":
      return createFolioCopyrightLevel();
    case "folio_xxix_dedication":
      return createFolioDedicationLevel();
    case "folio_xxx_epigraph":
      return createFolioEpigraphPageLevel();
    case "folio_xxxi_foreword":
      return createFolioForewordLevel();
    case "folio_xxxii_preface":
      return createFolioPrefaceLevel();
    case "folio_xxxiii_introduction":
      return createFolioIntroductionLevel();
    case "folio_xxxiv_body":
      return createFolioBodyMatterLevel();
    case "folio_xxxv_incipit":
      return createFolioIncipitLevel();
    case "folio_xxxvi_chapter":
      return createFolioChapterLevel();
    case "folio_xxxvii_interlude":
      return createFolioInterludeLevel();
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
    case "folio_xviii_colophon":
      return {
        id: "intro_colophon",
        text: "Colophon — ten drones, mirror and curtain.\nAppendix braided spines; this one stamps symmetry, weaves bands, then locks the seal—compositor’s mark.",
        ttlMs: 6400,
      };
    case "folio_xix_epilogue":
      return {
        id: "intro_epilogue",
        text: "Epilogue — ten drones, void ring then relay.\nColophon sealed the impression; this is the last corridor—then the witness signs your run.",
        ttlMs: 6600,
      };
    case "folio_xx_codex":
      return {
        id: "intro_codex",
        text: "Codex — ten drones, spine and thread.\nEpilogue closed the corridor; this binds facing pages, stitches pits, then the chronicler shelves the run.",
        ttlMs: 6800,
      };
    case "folio_xxi_afterline":
      return {
        id: "intro_afterline",
        text: "Afterline — ten drones, corridor then hopscotch.\nCodex bound the witness; this line attests the aisle, stitches islands, then treads to the notary.",
        ttlMs: 7000,
      };
    case "folio_xxii_vellum":
      return {
        id: "intro_vellum",
        text: "Vellum — ten drones, veil then fold stack.\nAfterline attested the line; this skin shears light, stacks tiers, then wax-bites to the illuminator.",
        ttlMs: 7200,
      };
    case "folio_xxiii_endpaper":
      return {
        id: "intro_endpaper",
        text: "Endpaper — ten drones, paste then hinge.\nVellum gilded the skin; this sheet ladders bands, swings tiers, then tucks the case before the conservator.",
        ttlMs: 7400,
      };
    case "folio_xxiv_flyleaf":
      return {
        id: "intro_flyleaf",
        text: "Flyleaf — ten drones, deckle then ruled void.\nEndpaper tucked the case; this blank frays the edge, grids silence, then presses to the prefacer.",
        ttlMs: 7600,
      };
    case "folio_xxv_halftitle":
      return {
        id: "intro_halftitle",
        text: "Halftitle — ten drones, strike then gutter.\nFlyleaf pressed the blank; this page runs one band, biases the margin, then leads the strip to the titler.",
        ttlMs: 7800,
      };
    case "folio_xxvi_frontispiece":
      return {
        id: "intro_frontispiece",
        text: "Frontispiece — ten drones, frame then caption.\nHalftitle struck the line; this plate mats an image, shelves the caption, then splits the folio to the engraver.",
        ttlMs: 8000,
      };
    case "folio_xxvii_titlepage":
      return {
        id: "intro_titlepage",
        text: "Title page — ten drones, masthead then byline.\nFrontispiece cut the plate; this spread lifts the head, treads the credit, then blocks the imprint before the imprinter.",
        ttlMs: 8200,
      };
    case "folio_xxviii_copyright":
      return {
        id: "intro_copyright",
        text: "Copyright — ten drones, statute then margin column.\nTitle page set the imprint; this page stacks the law, runs the spine, then boxes the catalog before the registrar.",
        ttlMs: 8400,
      };
    case "folio_xxix_dedication":
      return {
        id: "intro_dedication",
        text: "Dedication — ten drones, center well then brackets.\nCopyright filed the statute; this page frames the vow, flares the ornaments, then strips the promise before the patron.",
        ttlMs: 8600,
      };
    case "folio_xxx_epigraph":
      return {
        id: "intro_epigraph",
        text: "Epigraph — ten drones, pull quote then attribution.\nDedication spoke the vow; this page pulls the line, rails the cite, then dashes the lead before the citer.",
        ttlMs: 8800,
      };
    case "folio_xxxi_foreword":
      return {
        id: "intro_foreword",
        text: "Foreword — ten drones, guest frame then aside.\nEpigraph cited the line; this chapter frames the stranger, runs the margin aside, then shakes hands down the strip before the interlocutor.",
        ttlMs: 9000,
      };
    case "folio_xxxii_preface":
      return {
        id: "intro_preface",
        text: "Preface — ten drones, thesis plinth then method rail.\nForeword was the guest voice; this page is ours—stack the claim, run the method, promise the strip before the scrivener.",
        ttlMs: 9200,
      };
    case "folio_xxxiii_introduction":
      return {
        id: "intro_introduction",
        text: "Introduction — ten drones, lintel then ingress bay.\nPreface filed the promise; this chapter frames the door, commits the pockets, runs the lede before the usher.",
        ttlMs: 9400,
      };
    case "folio_xxxiv_body":
      return {
        id: "intro_body",
        text: "Body matter — ten drones, measure column then rag ladder.\nIntroduction crossed the door; this is the text block—set the measure, climb the breaks, ride the river before the galleyman.",
        ttlMs: 9600,
      };
    case "folio_xxxv_incipit":
      return {
        id: "intro_incipit",
        text: "Incipit — ten drones, drop cap then ornament frieze.\nBody matter set the column; this line opens the chapter—plinth the cap, rail the rule, run the rubric before the rubricator.",
        ttlMs: 9800,
      };
    case "folio_xxxvi_chapter":
      return {
        id: "intro_chapter",
        text: "Chapter — ten drones, running head then folio break.\nIncipit opened the line; this folio turns—band the head, break the page, climb the sections before the pager.",
        ttlMs: 10000,
      };
    case "folio_xxxvii_interlude":
      return {
        id: "intro_interlude",
        text: "Interlude — ten drones, bleed trim then signature stitch.\nChapter turned the leaf; this breath trims the edge, threads the midline, gathers the fold before the intervenor.",
        ttlMs: 10200,
      };
    case "folio_xxxviii_postlude":
      return {
        id: "intro_postlude",
        text: "Postlude - the next folio is still forming.\nThe board keeps the route visible now; the run lands when the stage is ready under hand.",
        ttlMs: 4200,
      };
    default:
      return {
        id: "intro",
        text: "Wrong city, wrong chapter — but the page still turns.\nE reads the ink (traces, hazards). Then run it like a legend.",
        ttlMs: 3200,
      };
  }
}
