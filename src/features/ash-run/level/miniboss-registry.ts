import type { PatrolEnemy } from "../entities/types";
import {
  createAfterwordScribeMiniboss,
  createAfterlineNotaryMiniboss,
  createVellumIlluminatorMiniboss,
  createEndpaperConservatorMiniboss,
  createFlyleafPrefacerMiniboss,
  createHalftitleTitlerMiniboss,
  createFrontispieceEngraverMiniboss,
  createCopyrightRegistrarMiniboss,
  createDedicationPatronMiniboss,
  createEpigraphCiterMiniboss,
  createForewordInterlocutorMiniboss,
  createPrefaceScrivenerMiniboss,
  createIntroductionUsherMiniboss,
  createBodyGalleymanMiniboss,
  createIncipitRubricatorMiniboss,
  createChapterPagerMiniboss,
  createInterludeIntervenorMiniboss,
  createTitlepageImprinterMiniboss,
  createAppendixBinderMiniboss,
  createCodexChroniclerMiniboss,
  createColophonCompositorMiniboss,
  createClosureMagistrateMiniboss,
  createEpilogueWitnessMiniboss,
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
    case "folio_xxxvi_chapter":
      return createChapterPagerMiniboss(floorY);
    case "folio_xxxvii_interlude":
      return createInterludeIntervenorMiniboss(floorY);
    case "folio_xxxv_incipit":
      return createIncipitRubricatorMiniboss(floorY);
    case "folio_xxxiv_body":
      return createBodyGalleymanMiniboss(floorY);
    case "folio_xxxiii_introduction":
      return createIntroductionUsherMiniboss(floorY);
    case "folio_xxxii_preface":
      return createPrefaceScrivenerMiniboss(floorY);
    case "folio_xxxi_foreword":
      return createForewordInterlocutorMiniboss(floorY);
    case "folio_xxx_epigraph":
      return createEpigraphCiterMiniboss(floorY);
    case "folio_xxix_dedication":
      return createDedicationPatronMiniboss(floorY);
    case "folio_xxviii_copyright":
      return createCopyrightRegistrarMiniboss(floorY);
    case "folio_xxvii_titlepage":
      return createTitlepageImprinterMiniboss(floorY);
    case "folio_xxvi_frontispiece":
      return createFrontispieceEngraverMiniboss(floorY);
    case "folio_xxv_halftitle":
      return createHalftitleTitlerMiniboss(floorY);
    case "folio_xxiv_flyleaf":
      return createFlyleafPrefacerMiniboss(floorY);
    case "folio_xxiii_endpaper":
      return createEndpaperConservatorMiniboss(floorY);
    case "folio_xxii_vellum":
      return createVellumIlluminatorMiniboss(floorY);
    case "folio_xxi_afterline":
      return createAfterlineNotaryMiniboss(floorY);
    case "folio_xx_codex":
      return createCodexChroniclerMiniboss(floorY);
    case "folio_xix_epilogue":
      return createEpilogueWitnessMiniboss(floorY);
    case "folio_xviii_colophon":
      return createColophonCompositorMiniboss(floorY);
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
