import type { PatrolEnemy } from "../entities/types";
import {
  createAfterwordScribeMiniboss,
  createAppendixBinderMiniboss,
  createClosureMagistrateMiniboss,
  createIndexStewardMiniboss,
  createPostscriptArchivistMiniboss,
  createCodaCuratorMiniboss,
  createEchoCustodianMiniboss,
  createExileGatekeeperMiniboss,
  createFractureHeraldMiniboss,
  createHorizonSovereignMiniboss,
  createLabSentinelMiniboss,
  createReckoningArbiterMiniboss,
  createVaultWardenMiniboss,
  createVergeHarbingerMiniboss,
  createTerminusAdjudicatorMiniboss,
  createZenithExarchMiniboss,
} from "../entities/enemy";

/** Boss gate spawns a miniboss tuned to the authored arena for this level id. */
export function createMinibossForLevel(levelId: string, floorY: number): PatrolEnemy {
  switch (levelId) {
    case "folio_xvii_appendix":
      return createAppendixBinderMiniboss(floorY);
    case "folio_xvi_index":
      return createIndexStewardMiniboss(floorY);
    case "folio_xv_postscript":
      return createPostscriptArchivistMiniboss(floorY);
    case "folio_xiv_afterword":
      return createAfterwordScribeMiniboss(floorY);
    case "folio_xiii_coda":
      return createCodaCuratorMiniboss(floorY);
    case "folio_xii_terminus":
      return createTerminusAdjudicatorMiniboss(floorY);
    case "folio_xi_zenith":
      return createZenithExarchMiniboss(floorY);
    case "folio_x_verge":
      return createVergeHarbingerMiniboss(floorY);
    case "folio_ix_echo":
      return createEchoCustodianMiniboss(floorY);
    case "folio_viii_horizon":
      return createHorizonSovereignMiniboss(floorY);
    case "folio_vii_exile":
      return createExileGatekeeperMiniboss(floorY);
    case "folio_vi_closure":
      return createClosureMagistrateMiniboss(floorY);
    case "folio_v_reckoning":
      return createReckoningArbiterMiniboss(floorY);
    case "folio_iv_fracture":
      return createFractureHeraldMiniboss(floorY);
    case "folio_iii_vault":
      return createVaultWardenMiniboss(floorY);
    case "blackcity_lab_escape":
    default:
      return createLabSentinelMiniboss(floorY);
  }
}
