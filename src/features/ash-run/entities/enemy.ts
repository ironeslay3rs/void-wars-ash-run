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
