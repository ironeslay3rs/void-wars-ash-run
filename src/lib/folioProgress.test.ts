import { FOLIO_STAGE_ORDER } from "@/features/ash-run/level/catalog";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyStageWin, loadFolioProgress } from "./folioProgress";

const V2_KEY = "void-wars-folio-progress-v2";

function installBrowserStorage() {
  const store: Record<string, string> = {};
  const ls = {
    getItem: (k: string) => (k in store ? store[k]! : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
  /* folioProgress uses global localStorage as well as window checks */
  Object.assign(globalThis, {
    localStorage: ls,
    window: { localStorage: ls },
  });
  return store;
}

describe("folioProgress (browser shim)", () => {
  beforeEach(() => {
    installBrowserStorage();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  it("first clear of blackcity_lab unlocks training_yard", () => {
    const r = applyStageWin("blackcity_lab_containment", ["blackcity_lab_containment", "training_yard"], {
      timeMs: 120_000,
    });
    expect(r.newlyUnlocked).toContain("training_yard");
    expect(r.progress.unlockedIds).toContain("training_yard");
    expect(r.wasFirstClear).toBe(true);
    expect(r.isNewRecord).toBe(true);
  });

  it("repeat clear does not unlock again but bumps count", () => {
    applyStageWin("blackcity_lab_containment", ["blackcity_lab_containment", "training_yard"]);
    const r = applyStageWin("blackcity_lab_containment", ["blackcity_lab_containment", "training_yard"], {
      timeMs: 90_000,
    });
    expect(r.newlyUnlocked).toEqual([]);
    expect(r.wasFirstClear).toBe(false);
    expect(r.progress.clearCountByStage["blackcity_lab_containment"]).toBeGreaterThanOrEqual(2);
    expect(r.isNewRecord).toBe(true);
  });

  it("persists to localStorage", () => {
    applyStageWin("blackcity_lab_containment", ["blackcity_lab_containment", "training_yard"]);
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("training_yard");
    expect(
      typeof (globalThis as unknown as { localStorage: Storage }).localStorage.getItem(
        V2_KEY,
      ),
    ).toBe("string");
  });

  it("first clear of training_yard unlocks folio_iii_vault in full chain", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    const r = applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_iii_vault");
    expect(r.progress.unlockedIds).toContain("folio_iii_vault");
  });

  it("first clear of folio_iii_vault unlocks folio_iv_fracture", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_iv_fracture");
    expect(r.progress.unlockedIds).toContain("folio_iv_fracture");
  });

  it("load repairs unlock when vault was cleared before Folio IV shipped", () => {
    const partial = {
      unlockedIds: ["blackcity_lab_containment", "training_yard", "folio_iii_vault"],
      clearedIds: ["blackcity_lab_containment", "training_yard", "folio_iii_vault"],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_iv_fracture");
  });

  it("first clear of folio_iv_fracture unlocks folio_v_reckoning", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_v_reckoning");
    expect(r.progress.unlockedIds).toContain("folio_v_reckoning");
  });

  it("load repairs unlock when fracture was cleared before Folio V shipped", () => {
    const partial = {
      unlockedIds: ["blackcity_lab_containment", "training_yard", "folio_iii_vault", "folio_iv_fracture"],
      clearedIds: ["blackcity_lab_containment", "training_yard", "folio_iii_vault", "folio_iv_fracture"],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_v_reckoning");
  });

  it("first clear of folio_v_reckoning unlocks folio_vi_closure", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_vi_closure");
    expect(r.progress.unlockedIds).toContain("folio_vi_closure");
  });

  it("load repairs unlock when Folio V was cleared before VI shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
      ],
      clearedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_vi_closure");
  });

  it("first clear of folio_vi_closure unlocks folio_vii_exile", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_vii_exile");
    expect(r.progress.unlockedIds).toContain("folio_vii_exile");
  });

  it("load repairs unlock when Folio VI was cleared before VII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
      ],
      clearedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_vii_exile");
  });

  it("first clear of folio_vii_exile unlocks folio_viii_horizon", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_viii_horizon");
    expect(r.progress.unlockedIds).toContain("folio_viii_horizon");
  });

  it("load repairs unlock when Folio VII was cleared before VIII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
      ],
      clearedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_viii_horizon");
  });

  it("first clear of folio_viii_horizon unlocks folio_ix_echo", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_ix_echo");
    expect(r.progress.unlockedIds).toContain("folio_ix_echo");
  });

  it("load repairs unlock when Folio VIII was cleared before IX shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
      ],
      clearedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_ix_echo");
  });

  it("first clear of folio_ix_echo unlocks folio_x_verge", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_x_verge");
    expect(r.progress.unlockedIds).toContain("folio_x_verge");
  });

  it("load repairs unlock when Folio IX was cleared before X shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
        "folio_ix_echo",
      ],
      clearedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
        "folio_ix_echo",
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_x_verge");
  });

  it("first clear of folio_x_verge unlocks folio_xi_zenith", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xi_zenith");
    expect(r.progress.unlockedIds).toContain("folio_xi_zenith");
  });

  it("load repairs unlock when Folio X was cleared before XI shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
        "folio_ix_echo",
        "folio_x_verge",
      ],
      clearedIds: [
        "blackcity_lab_containment",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
        "folio_ix_echo",
        "folio_x_verge",
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xi_zenith");
  });

  it("first clear of folio_xi_zenith unlocks folio_xii_terminus", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xii_terminus");
    expect(r.progress.unlockedIds).toContain("folio_xii_terminus");
  });

  it("load repairs unlock when Folio XI was cleared before XII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xii_terminus");
  });

  it("first clear of folio_xii_terminus unlocks folio_xiii_coda", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xiii_coda");
    expect(r.progress.unlockedIds).toContain("folio_xiii_coda");
  });

  it("load repairs unlock when Folio XII was cleared before XIII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xiii_coda");
  });

  it("first clear of folio_xiii_coda unlocks folio_xiv_afterword", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xiv_afterword");
    expect(r.progress.unlockedIds).toContain("folio_xiv_afterword");
  });

  it("load repairs unlock when Folio XIII was cleared before XIV shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xiv_afterword");
  });

  it("first clear of folio_xiv_afterword unlocks folio_xv_postscript", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xv_postscript");
    expect(r.progress.unlockedIds).toContain("folio_xv_postscript");
  });

  it("load repairs unlock when Folio XIV was cleared before XV shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xv_postscript");
  });

  it("first clear of folio_xv_postscript unlocks folio_xvi_index", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xvi_index");
    expect(r.progress.unlockedIds).toContain("folio_xvi_index");
  });

  it("load repairs unlock when Folio XV was cleared before XVI shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xvi_index");
  });

  it("first clear of folio_xvi_index unlocks folio_xvii_appendix", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xvii_appendix");
    expect(r.progress.unlockedIds).toContain("folio_xvii_appendix");
  });

  it("load repairs unlock when Folio XVI was cleared before XVII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xvii_appendix");
  });

  it("first clear of folio_xvii_appendix unlocks folio_xviii_colophon", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xviii_colophon");
    expect(r.progress.unlockedIds).toContain("folio_xviii_colophon");
  });

  it("load repairs unlock when Folio XVII was cleared before XVIII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xviii_colophon");
  });

  it("first clear of folio_xviii_colophon unlocks folio_xix_epilogue", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xix_epilogue");
    expect(r.progress.unlockedIds).toContain("folio_xix_epilogue");
  });

  it("load repairs unlock when Folio XVIII was cleared before XIX shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xix_epilogue");
  });

  it("first clear of folio_xix_epilogue unlocks folio_xx_codex", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xx_codex");
    expect(r.progress.unlockedIds).toContain("folio_xx_codex");
  });

  it("load repairs unlock when Folio XIX was cleared before XX shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xx_codex");
  });

  it("first clear of folio_xx_codex unlocks folio_xxi_afterline", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxi_afterline");
    expect(r.progress.unlockedIds).toContain("folio_xxi_afterline");
  });

  it("load repairs unlock when Folio XX was cleared before XXI shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxi_afterline");
  });

  it("first clear of folio_xxi_afterline unlocks folio_xxii_vellum", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxii_vellum");
    expect(r.progress.unlockedIds).toContain("folio_xxii_vellum");
  });

  it("load repairs unlock when Folio XXI was cleared before XXII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxii_vellum");
  });

  it("first clear of folio_xxii_vellum unlocks folio_xxiii_endpaper", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxiii_endpaper");
    expect(r.progress.unlockedIds).toContain("folio_xxiii_endpaper");
  });

  it("load repairs unlock when Folio XXII was cleared before XXIII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxiii_endpaper");
  });

  it("first clear of folio_xxiii_endpaper unlocks folio_xxiv_flyleaf", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxiv_flyleaf");
    expect(r.progress.unlockedIds).toContain("folio_xxiv_flyleaf");
  });

  it("load repairs unlock when Folio XXIII was cleared before XXIV shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxiv_flyleaf");
  });

  it("first clear of folio_xxiv_flyleaf unlocks folio_xxv_halftitle", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxv_halftitle");
    expect(r.progress.unlockedIds).toContain("folio_xxv_halftitle");
  });

  it("load repairs unlock when Folio XXIV was cleared before XXV shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxv_halftitle");
  });

  it("first clear of folio_xxv_halftitle unlocks folio_xxvi_frontispiece", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxvi_frontispiece");
    expect(r.progress.unlockedIds).toContain("folio_xxvi_frontispiece");
  });

  it("load repairs unlock when Folio XXV was cleared before XXVI shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxvi_frontispiece");
  });

  it("first clear of folio_xxvi_frontispiece unlocks folio_xxvii_titlepage", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxvii_titlepage");
    expect(r.progress.unlockedIds).toContain("folio_xxvii_titlepage");
  });

  it("load repairs unlock when Folio XXVI was cleared before XXVII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxvii_titlepage");
  });

  it("first clear of folio_xxvii_titlepage unlocks folio_xxviii_copyright", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxviii_copyright");
    expect(r.progress.unlockedIds).toContain("folio_xxviii_copyright");
  });

  it("load repairs unlock when Folio XXVII was cleared before XXVIII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxviii_copyright");
  });

  it("first clear of folio_xxviii_copyright unlocks folio_xxix_dedication", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxix_dedication");
    expect(r.progress.unlockedIds).toContain("folio_xxix_dedication");
  });

  it("load repairs unlock when Folio XXVIII was cleared before XXIX shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxix_dedication");
  });

  it("first clear of folio_xxix_dedication unlocks folio_xxx_epigraph", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxx_epigraph");
    expect(r.progress.unlockedIds).toContain("folio_xxx_epigraph");
  });

  it("load repairs unlock when Folio XXIX was cleared before XXX shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxx_epigraph");
  });

  it("first clear of folio_xxx_epigraph unlocks folio_xxxi_foreword", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxx_epigraph", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxxi_foreword");
    expect(r.progress.unlockedIds).toContain("folio_xxxi_foreword");
  });

  it("first clear of folio_xxxi_foreword unlocks folio_xxxii_preface", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxx_epigraph", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxxi_foreword", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxxii_preface");
    expect(r.progress.unlockedIds).toContain("folio_xxxii_preface");
  });

  it("first clear of folio_xxxii_preface unlocks folio_xxxiii_introduction", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxx_epigraph", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxi_foreword", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxxii_preface", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxxiii_introduction");
    expect(r.progress.unlockedIds).toContain("folio_xxxiii_introduction");
  });

  it("first clear of folio_xxxiii_introduction unlocks folio_xxxiv_body", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxx_epigraph", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxi_foreword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxii_preface", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxxiii_introduction", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxxiv_body");
    expect(r.progress.unlockedIds).toContain("folio_xxxiv_body");
  });

  it("first clear of folio_xxxiv_body unlocks folio_xxxv_incipit", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxx_epigraph", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxi_foreword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxii_preface", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxiii_introduction", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxxiv_body", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxxv_incipit");
    expect(r.progress.unlockedIds).toContain("folio_xxxv_incipit");
  });

  it("first clear of folio_xxxv_incipit unlocks folio_xxxvi_chapter", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxx_epigraph", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxi_foreword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxii_preface", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxiii_introduction", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxiv_body", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxxv_incipit", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxxvi_chapter");
    expect(r.progress.unlockedIds).toContain("folio_xxxvi_chapter");
  });

  it("first clear of folio_xxxvi_chapter unlocks folio_xxxvii_interlude", () => {
    applyStageWin("blackcity_lab_containment", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    applyStageWin("folio_v_reckoning", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vi_closure", FOLIO_STAGE_ORDER);
    applyStageWin("folio_vii_exile", FOLIO_STAGE_ORDER);
    applyStageWin("folio_viii_horizon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_ix_echo", FOLIO_STAGE_ORDER);
    applyStageWin("folio_x_verge", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xi_zenith", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xii_terminus", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiii_coda", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xiv_afterword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xv_postscript", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvi_index", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xvii_appendix", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xviii_colophon", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xix_epilogue", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xx_codex", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxi_afterline", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxii_vellum", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiii_endpaper", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxiv_flyleaf", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxv_halftitle", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvi_frontispiece", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxvii_titlepage", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxviii_copyright", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxix_dedication", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxx_epigraph", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxi_foreword", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxii_preface", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxiii_introduction", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxiv_body", FOLIO_STAGE_ORDER);
    applyStageWin("folio_xxxv_incipit", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_xxxvi_chapter", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_xxxvii_interlude");
    expect(r.progress.unlockedIds).toContain("folio_xxxvii_interlude");
  });

  it("load repairs unlock when Folio XXX was cleared before XXXI shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
        folio_xxx_epigraph: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxxi_foreword");
  });

  it("load repairs unlock when Folio XXXI was cleared before XXXII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
        folio_xxx_epigraph: 1,
        folio_xxxi_foreword: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxxii_preface");
  });

  it("load repairs unlock when Folio XXXII was cleared before XXXIII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
        folio_xxx_epigraph: 1,
        folio_xxxi_foreword: 1,
        folio_xxxii_preface: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxxiii_introduction");
  });

  it("load repairs unlock when Folio XXXIII was cleared before XXXIV shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
        folio_xxx_epigraph: 1,
        folio_xxxi_foreword: 1,
        folio_xxxii_preface: 1,
        folio_xxxiii_introduction: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxxiv_body");
  });

  it("load repairs unlock when Folio XXXIV was cleared before XXXV shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
        folio_xxx_epigraph: 1,
        folio_xxxi_foreword: 1,
        folio_xxxii_preface: 1,
        folio_xxxiii_introduction: 1,
        folio_xxxiv_body: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxxv_incipit");
  });

  it("load repairs unlock when Folio XXXV was cleared before XXXVI shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
        folio_xxx_epigraph: 1,
        folio_xxxi_foreword: 1,
        folio_xxxii_preface: 1,
        folio_xxxiii_introduction: 1,
        folio_xxxiv_body: 1,
        folio_xxxv_incipit: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxxvi_chapter");
  });

  it("load repairs unlock when Folio XXXVI was cleared before XXXVII shipped", () => {
    const partial = {
      unlockedIds: [
        "blackcity_lab_containment",
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
      ],
      clearedIds: [
        "blackcity_lab_containment",
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
      ],
      clearCountByStage: {
        blackcity_lab_containment: 1,
        training_yard: 1,
        folio_iii_vault: 1,
        folio_iv_fracture: 1,
        folio_v_reckoning: 1,
        folio_vi_closure: 1,
        folio_vii_exile: 1,
        folio_viii_horizon: 1,
        folio_ix_echo: 1,
        folio_x_verge: 1,
        folio_xi_zenith: 1,
        folio_xii_terminus: 1,
        folio_xiii_coda: 1,
        folio_xiv_afterword: 1,
        folio_xv_postscript: 1,
        folio_xvi_index: 1,
        folio_xvii_appendix: 1,
        folio_xviii_colophon: 1,
        folio_xix_epilogue: 1,
        folio_xx_codex: 1,
        folio_xxi_afterline: 1,
        folio_xxii_vellum: 1,
        folio_xxiii_endpaper: 1,
        folio_xxiv_flyleaf: 1,
        folio_xxv_halftitle: 1,
        folio_xxvi_frontispiece: 1,
        folio_xxvii_titlepage: 1,
        folio_xxviii_copyright: 1,
        folio_xxix_dedication: 1,
        folio_xxx_epigraph: 1,
        folio_xxxi_foreword: 1,
        folio_xxxii_preface: 1,
        folio_xxxiii_introduction: 1,
        folio_xxxiv_body: 1,
        folio_xxxv_incipit: 1,
        folio_xxxvi_chapter: 1,
      },
      bestTimeMsByStage: {},
    };
    (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(
      V2_KEY,
      JSON.stringify(partial),
    );
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("folio_xxxvii_interlude");
  });
});
