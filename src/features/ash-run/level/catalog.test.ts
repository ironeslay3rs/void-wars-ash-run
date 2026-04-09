import { describe, expect, it } from "vitest";
import { folioLockHint, FOLIO_STAGE_ORDER, FOLIO_STAGES } from "./catalog";

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

  it("Folio XVIII is roadmap-only and not in unlock order", () => {
    const m = FOLIO_STAGES.find((s) => s.id === "folio_xviii_colophon");
    expect(m?.roadmapOnly).toBe(true);
    expect([...FOLIO_STAGE_ORDER].includes("folio_xviii_colophon")).toBe(false);
  });

  it("folioLockHint for Folio XVIII teaser names Folio XVII", () => {
    const h = folioLockHint("folio_xviii_colophon", { unlockedIds: [] });
    expect(h).toContain("Folio XVII");
  });
});
