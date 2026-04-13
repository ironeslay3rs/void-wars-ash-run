import { describe, expect, it } from "vitest";
import {
  folioCanonFocus,
  folioLockHint,
  FOLIO_STAGE_ORDER,
  FOLIO_STAGES,
} from "./catalog";

describe("catalog", () => {
  it("Folio V is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_v_reckoning");
    const v = FOLIO_STAGES.find((s) => s.id === "folio_v_reckoning");
    expect(v?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio V names Folio IV", () => {
    const h = folioLockHint("folio_v_reckoning", { unlockedIds: ["folio_iii_vault"] });
    expect(h).toContain("Folio IV");
  });

  it("Folio VI is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_vi_closure");
    const viMeta = FOLIO_STAGES.find((s) => s.id === "folio_vi_closure");
    expect(viMeta?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio VI names Folio V", () => {
    const h = folioLockHint("folio_vi_closure", { unlockedIds: ["folio_iv_fracture"] });
    expect(h).toContain("Folio V");
  });

  it("Folio VII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_vii_exile");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_vii_exile");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio VII names Folio VI", () => {
    const h = folioLockHint("folio_vii_exile", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio VI");
  });

  it("Folio VIII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_viii_horizon");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_viii_horizon");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio VIII names Folio VII", () => {
    const h = folioLockHint("folio_viii_horizon", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio VII");
  });

  it("Folio IX is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_ix_echo");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_ix_echo");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio IX names Folio VIII", () => {
    const h = folioLockHint("folio_ix_echo", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio VIII");
  });

  it("Folio X is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_x_verge");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_x_verge");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio X names Folio IX", () => {
    const h = folioLockHint("folio_x_verge", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio IX");
  });

  it("Folio XI is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xi_zenith");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xi_zenith");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XI names Folio X", () => {
    const h = folioLockHint("folio_xi_zenith", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio X");
  });

  it("Folio XII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xii_terminus");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xii_terminus");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XII names Folio XI", () => {
    const h = folioLockHint("folio_xii_terminus", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XI");
  });

  it("Folio XIII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xiii_coda");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xiii_coda");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XIII names Folio XII", () => {
    const h = folioLockHint("folio_xiii_coda", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XII");
  });

  it("Folio XIV is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xiv_afterword");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xiv_afterword");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XIV names Folio XIII", () => {
    const h = folioLockHint("folio_xiv_afterword", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XIII");
  });

  it("Folio XV is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xv_postscript");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xv_postscript");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XV names Folio XIV", () => {
    const h = folioLockHint("folio_xv_postscript", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XIV");
  });

  it("Folio XVI is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xvi_index");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xvi_index");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XVI names Folio XV", () => {
    const h = folioLockHint("folio_xvi_index", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XV");
  });

  it("Folio XVII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xvii_appendix");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xvii_appendix");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XVII names Folio XVI", () => {
    const h = folioLockHint("folio_xvii_appendix", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XVI");
  });

  it("Folio XVIII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xviii_colophon");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xviii_colophon");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XVIII names Folio XVII", () => {
    const h = folioLockHint("folio_xviii_colophon", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XVII");
  });

  it("Folio XIX is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xix_epilogue");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xix_epilogue");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XIX names Folio XVIII", () => {
    const h = folioLockHint("folio_xix_epilogue", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XVIII");
  });

  it("Folio XX is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xx_codex");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xx_codex");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XX names Folio XIX", () => {
    const h = folioLockHint("folio_xx_codex", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XIX");
  });

  it("Folio XXI is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxi_afterline");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxi_afterline");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXI names Folio XX", () => {
    const h = folioLockHint("folio_xxi_afterline", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XX");
  });

  it("Folio XXII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxii_vellum");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxii_vellum");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXII names Folio XXI", () => {
    const h = folioLockHint("folio_xxii_vellum", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXI");
  });

  it("Folio XXIII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxiii_endpaper");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxiii_endpaper");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXIII names Folio XXII", () => {
    const h = folioLockHint("folio_xxiii_endpaper", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXII");
  });

  it("Folio XXIV is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxiv_flyleaf");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxiv_flyleaf");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXIV names Folio XXIII", () => {
    const h = folioLockHint("folio_xxiv_flyleaf", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXIII");
  });

  it("Folio XXV is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxv_halftitle");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxv_halftitle");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXV names Folio XXIV", () => {
    const h = folioLockHint("folio_xxv_halftitle", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXIV");
  });

  it("Folio XXVI is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxvi_frontispiece");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxvi_frontispiece");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXVI names Folio XXV", () => {
    const h = folioLockHint("folio_xxvi_frontispiece", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXV");
  });

  it("Folio XXVII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxvii_titlepage");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxvii_titlepage");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXVII names Folio XXVI", () => {
    const h = folioLockHint("folio_xxvii_titlepage", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXVI");
  });

  it("Folio XXVIII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxviii_copyright");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxviii_copyright");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXVIII names Folio XXVII", () => {
    const h = folioLockHint("folio_xxviii_copyright", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXVII");
  });

  it("Folio XXIX is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxix_dedication");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxix_dedication");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXIX names Folio XXVIII", () => {
    const h = folioLockHint("folio_xxix_dedication", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXVIII");
  });

  it("Folio XXX is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxx_epigraph");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxx_epigraph");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXX names Folio XXIX", () => {
    const h = folioLockHint("folio_xxx_epigraph", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXIX");
  });

  it("Folio XXXI is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxxi_foreword");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxi_foreword");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("Folio XXXII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxxii_preface");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxii_preface");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("Folio XXXIII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxxiii_introduction");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxiii_introduction");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("Folio XXXIV is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxxiv_body");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxiv_body");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXXI names Folio XXX", () => {
    const h = folioLockHint("folio_xxxi_foreword", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXX");
  });

  it("folioLockHint for locked Folio XXXIII names Folio XXXII", () => {
    const h = folioLockHint("folio_xxxiii_introduction", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXXII");
  });

  it("folioLockHint for locked Folio XXXIV names Folio XXXIII", () => {
    const h = folioLockHint("folio_xxxiv_body", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXXIII");
  });

  it("Folio XXXV is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxxv_incipit");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxv_incipit");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXXV names Folio XXXIV", () => {
    const h = folioLockHint("folio_xxxv_incipit", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXXIV");
  });

  it("Folio XXXVI is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxxvi_chapter");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxvi_chapter");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXXVI names Folio XXXV", () => {
    const h = folioLockHint("folio_xxxvi_chapter", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXXV");
  });

  it("Folio XXXVII is playable in unlock order", () => {
    expect(FOLIO_STAGE_ORDER).toContain("folio_xxxvii_interlude");
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxvii_interlude");
    expect(m?.roadmapOnly).toBeUndefined();
  });

  it("folioLockHint for locked Folio XXXVII names Folio XXXVI", () => {
    const h = folioLockHint("folio_xxxvii_interlude", { unlockedIds: ["folio_v_reckoning"] });
    expect(h).toContain("Folio XXXVI");
  });

  it("Folio XXXVIII postlude is roadmap-only and not in unlock order", () => {
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xxxviii_postlude");
    expect(m?.roadmapOnly).toBe(true);
    expect([...FOLIO_STAGE_ORDER].includes("folio_xxxviii_postlude")).toBe(false);
  });

  it("folioLockHint for Folio XXXVIII teaser mentions latest clearable folio", () => {
    const h = folioLockHint("folio_xxxviii_postlude", { unlockedIds: [] });
    expect(h).toContain("Folio XXXVII");
  });

  it("canon focus frames the opening around Blackcity", () => {
    expect(folioCanonFocus("blackcity_lab").label).toBe("Blackcity breach");
  });

  it("canon focus frames mid-folios around mixed evolution", () => {
    expect(folioCanonFocus("folio_xv_postscript").label).toBe("Mixed evolution");
  });

  it("canon focus frames late folios around Oblivion pressure", () => {
    expect(folioCanonFocus("folio_xxxvi_chapter").label).toBe("Oblivion margin");
  });

  it("canon focus marks the teaser folio as roadmap-only", () => {
    expect(folioCanonFocus("folio_xxxviii_postlude").label).toBe("Roadmap signal");
  });
});
