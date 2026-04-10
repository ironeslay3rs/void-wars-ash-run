import type { PatrolEnemy } from "./types";

/** Authoring + HUD: sentinel HP budget for this slice. */
export const LAB_SENTINEL_MAX_HP = 4;

/** Miniboss spawned when Ash crosses the lab boss gate — arena matches blackcity-lab zone 7. */
export function createLabSentinelMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "lab_sentinel",
    x: 2970,
    y: floorY - 52,
    w: 40,
    h: 44,
    vx: -88,
    patrolLeft: 2798,
    patrolRight: 3128,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Vault Folio III warden — patrol box matches `folio-vault` arena floor span. */
export function createVaultWardenMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "vault_warden",
    x: 1880,
    y: floorY - 50,
    w: 38,
    h: 42,
    vx: 92,
    patrolLeft: 1640,
    patrolRight: 2055,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio IV herald — patrol matches `folio-fracture` arena floor. */
export function createFractureHeraldMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "fracture_herald",
    x: 2160,
    y: floorY - 52,
    w: 40,
    h: 44,
    vx: -96,
    patrolLeft: 1840,
    patrolRight: 2500,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio V arbiter — patrol matches `folio-reckoning` arena floor. */
export function createReckoningArbiterMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "reckoning_arbiter",
    x: 2510,
    y: floorY - 54,
    w: 42,
    h: 46,
    vx: 88,
    patrolLeft: 2180,
    patrolRight: 2840,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio VI magistrate — patrol matches `folio-closure` arena floor. */
export function createClosureMagistrateMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "closure_magistrate",
    x: 2780,
    y: floorY - 56,
    w: 44,
    h: 48,
    vx: -94,
    patrolLeft: 2420,
    patrolRight: 3120,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio VII gatekeeper — patrol matches `folio-exile` arena floor. */
export function createExileGatekeeperMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "exile_gatekeeper",
    x: 2920,
    y: floorY - 58,
    w: 46,
    h: 50,
    vx: 90,
    patrolLeft: 2540,
    patrolRight: 3320,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio VIII sovereign — patrol matches `folio-horizon` arena floor. */
export function createHorizonSovereignMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "horizon_sovereign",
    x: 3260,
    y: floorY - 60,
    w: 48,
    h: 52,
    vx: -86,
    patrolLeft: 2820,
    patrolRight: 3920,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio IX custodian — patrol matches `folio-echo` arena floor. */
export function createEchoCustodianMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "echo_custodian",
    x: 3660,
    y: floorY - 62,
    w: 50,
    h: 54,
    vx: 84,
    patrolLeft: 3120,
    patrolRight: 4320,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio X harbinger — patrol matches `folio-verge` arena floor. */
export function createVergeHarbingerMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "verge_harbinger",
    x: 3920,
    y: floorY - 64,
    w: 52,
    h: 56,
    vx: -80,
    patrolLeft: 3240,
    patrolRight: 4520,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XI exarch — patrol matches `folio-zenith` arena floor. */
export function createZenithExarchMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "zenith_exarch",
    x: 4100,
    y: floorY - 66,
    w: 54,
    h: 58,
    vx: 76,
    patrolLeft: 3360,
    patrolRight: 4780,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XII adjudicator — patrol matches `folio-terminus` arena floor. */
export function createTerminusAdjudicatorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "terminus_adjudicator",
    x: 4160,
    y: floorY - 68,
    w: 56,
    h: 60,
    vx: -72,
    patrolLeft: 3480,
    patrolRight: 4920,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XIII curator — patrol matches `folio-coda` arena floor. */
export function createCodaCuratorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "coda_curator",
    x: 4880,
    y: floorY - 70,
    w: 58,
    h: 62,
    vx: 70,
    patrolLeft: 4180,
    patrolRight: 5640,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XIV scribe — patrol matches `folio-afterword` arena floor. */
export function createAfterwordScribeMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "afterword_scribe",
    x: 5020,
    y: floorY - 72,
    w: 60,
    h: 64,
    vx: -68,
    patrolLeft: 4320,
    patrolRight: 5880,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XV archivist — patrol matches `folio-postscript` arena floor. */
export function createPostscriptArchivistMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "postscript_archivist",
    x: 5320,
    y: floorY - 74,
    w: 62,
    h: 66,
    vx: 66,
    patrolLeft: 4620,
    patrolRight: 6040,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XVI steward — patrol matches `folio-index` arena floor. */
export function createIndexStewardMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "index_steward",
    x: 5480,
    y: floorY - 74,
    w: 62,
    h: 66,
    vx: -64,
    patrolLeft: 4860,
    patrolRight: 6220,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XVII binder — patrol matches `folio-appendix` arena floor. */
export function createAppendixBinderMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "appendix_binder",
    x: 5640,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 62,
    patrolLeft: 4980,
    patrolRight: 6296,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XVIII compositor — patrol matches `folio-colophon` arena floor. */
export function createColophonCompositorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "colophon_compositor",
    x: 5780,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -58,
    patrolLeft: 5120,
    patrolRight: 6436,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XIX witness — patrol matches `folio-epilogue` arena floor. */
export function createEpilogueWitnessMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "epilogue_witness",
    x: 6980,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 54,
    patrolLeft: 6340,
    patrolRight: 7656,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XX chronicler — patrol matches `folio-codex` arena floor. */
export function createCodexChroniclerMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "codex_chronicler",
    x: 7260,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -50,
    patrolLeft: 6620,
    patrolRight: 7936,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXI notary — patrol matches `folio-afterline` arena floor. */
export function createAfterlineNotaryMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "afterline_notary",
    x: 7580,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -44,
    patrolLeft: 6920,
    patrolRight: 8236,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXII illuminator — patrol matches `folio-vellum` arena floor. */
export function createVellumIlluminatorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "vellum_illuminator",
    x: 7660,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 46,
    patrolLeft: 7000,
    patrolRight: 8316,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXIII conservator — patrol matches `folio-endpaper` arena floor. */
export function createEndpaperConservatorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "endpaper_conservator",
    x: 7740,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -42,
    patrolLeft: 7080,
    patrolRight: 8396,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXIV prefacer — patrol matches `folio-flyleaf` arena floor. */
export function createFlyleafPrefacerMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "flyleaf_prefacer",
    x: 7880,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 44,
    patrolLeft: 7160,
    patrolRight: 8556,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXV titler — patrol matches `folio-halftitle` arena floor. */
export function createHalftitleTitlerMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "halftitle_titler",
    x: 7960,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -40,
    patrolLeft: 7240,
    patrolRight: 8636,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXVI engraver — patrol matches `folio-frontispiece` arena floor. */
export function createFrontispieceEngraverMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "frontispiece_engraver",
    x: 8040,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 38,
    patrolLeft: 7320,
    patrolRight: 8716,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXVII imprinter — patrol matches `folio-titlepage` arena floor. */
export function createTitlepageImprinterMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "titlepage_imprinter",
    x: 8120,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -34,
    patrolLeft: 7400,
    patrolRight: 8796,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXVIII registrar — patrol matches `folio-copyright` arena floor. */
export function createCopyrightRegistrarMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "copyright_registrar",
    x: 8200,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 32,
    patrolLeft: 7480,
    patrolRight: 8876,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXIX patron — patrol matches `folio-dedication` arena floor. */
export function createDedicationPatronMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "dedication_patron",
    x: 8280,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -30,
    patrolLeft: 7560,
    patrolRight: 8956,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXX citer — patrol matches `folio-epigraph-page` arena floor. */
export function createEpigraphCiterMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "epigraph_citer",
    x: 8360,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 28,
    patrolLeft: 7640,
    patrolRight: 9036,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXXI interlocutor — patrol matches `folio-foreword` arena floor. */
export function createForewordInterlocutorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "foreword_interlocutor",
    x: 8440,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -26,
    patrolLeft: 7720,
    patrolRight: 9116,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXXII scrivener — patrol matches `folio-preface` arena floor. */
export function createPrefaceScrivenerMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "preface_scrivener",
    x: 8520,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 26,
    patrolLeft: 7800,
    patrolRight: 9196,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXXIII usher — patrol matches `folio-introduction` arena floor. */
export function createIntroductionUsherMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "introduction_usher",
    x: 8580,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -28,
    patrolLeft: 7880,
    patrolRight: 9276,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXXIV galleyman — patrol matches `folio-body` arena floor. */
export function createBodyGalleymanMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "body_galleyman",
    x: 8660,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 28,
    patrolLeft: 7960,
    patrolRight: 9356,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXXV rubricator — patrol matches `folio-incipit` arena floor. */
export function createIncipitRubricatorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "incipit_rubricator",
    x: 8740,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: -26,
    patrolLeft: 8040,
    patrolRight: 9436,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXXVI pager — patrol matches `folio-chapter` arena floor. */
export function createChapterPagerMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "chapter_pager",
    x: 8820,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 26,
    patrolLeft: 8120,
    patrolRight: 9516,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}

/** Folio XXXVII intervenor — patrol matches `folio-interlude` arena floor. */
export function createInterludeIntervenorMiniboss(floorY: number): PatrolEnemy {
  return {
    kind: "patrol",
    id: "interlude_intervenor",
    x: 8900,
    y: floorY - 74,
    w: 64,
    h: 66,
    vx: 26,
    patrolLeft: 8200,
    patrolRight: 9596,
    hp: LAB_SENTINEL_MAX_HP,
    damage: 1,
    isMiniboss: true,
    hurtCooldownMs: 0,
  };
}
