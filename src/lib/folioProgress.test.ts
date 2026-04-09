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
    const r = applyStageWin("blackcity_lab", ["blackcity_lab", "training_yard"], {
      timeMs: 120_000,
    });
    expect(r.newlyUnlocked).toContain("training_yard");
    expect(r.progress.unlockedIds).toContain("training_yard");
    expect(r.wasFirstClear).toBe(true);
    expect(r.isNewRecord).toBe(true);
  });

  it("repeat clear does not unlock again but bumps count", () => {
    applyStageWin("blackcity_lab", ["blackcity_lab", "training_yard"]);
    const r = applyStageWin("blackcity_lab", ["blackcity_lab", "training_yard"], {
      timeMs: 90_000,
    });
    expect(r.newlyUnlocked).toEqual([]);
    expect(r.wasFirstClear).toBe(false);
    expect(r.progress.clearCountByStage["blackcity_lab"]).toBeGreaterThanOrEqual(2);
    expect(r.isNewRecord).toBe(true);
  });

  it("persists to localStorage", () => {
    applyStageWin("blackcity_lab", ["blackcity_lab", "training_yard"]);
    const loaded = loadFolioProgress();
    expect(loaded.unlockedIds).toContain("training_yard");
    expect(
      typeof (globalThis as unknown as { localStorage: Storage }).localStorage.getItem(
        V2_KEY,
      ),
    ).toBe("string");
  });

  it("first clear of training_yard unlocks folio_iii_vault in full chain", () => {
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
    const r = applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_iii_vault");
    expect(r.progress.unlockedIds).toContain("folio_iii_vault");
  });

  it("first clear of folio_iii_vault unlocks folio_iv_fracture", () => {
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_iv_fracture");
    expect(r.progress.unlockedIds).toContain("folio_iv_fracture");
  });

  it("load repairs unlock when vault was cleared before Folio IV shipped", () => {
    const partial = {
      unlockedIds: ["blackcity_lab", "training_yard", "folio_iii_vault"],
      clearedIds: ["blackcity_lab", "training_yard", "folio_iii_vault"],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
    applyStageWin("training_yard", FOLIO_STAGE_ORDER);
    applyStageWin("folio_iii_vault", FOLIO_STAGE_ORDER);
    const r = applyStageWin("folio_iv_fracture", FOLIO_STAGE_ORDER);
    expect(r.newlyUnlocked).toContain("folio_v_reckoning");
    expect(r.progress.unlockedIds).toContain("folio_v_reckoning");
  });

  it("load repairs unlock when fracture was cleared before Folio V shipped", () => {
    const partial = {
      unlockedIds: ["blackcity_lab", "training_yard", "folio_iii_vault", "folio_iv_fracture"],
      clearedIds: ["blackcity_lab", "training_yard", "folio_iii_vault", "folio_iv_fracture"],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
      ],
      clearedIds: [
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
      ],
      clearedIds: [
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
      ],
      clearedIds: [
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
      ],
      clearedIds: [
        "blackcity_lab",
        "training_yard",
        "folio_iii_vault",
        "folio_iv_fracture",
        "folio_v_reckoning",
        "folio_vi_closure",
        "folio_vii_exile",
        "folio_viii_horizon",
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
        "blackcity_lab",
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
        "blackcity_lab",
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
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
      ],
      clearedIds: [
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
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
      ],
      clearedIds: [
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
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
      ],
      clearedIds: [
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
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
      ],
      clearedIds: [
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
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
      ],
      clearedIds: [
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
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
      ],
      clearedIds: [
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
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
    applyStageWin("blackcity_lab", FOLIO_STAGE_ORDER);
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
      ],
      clearedIds: [
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
      ],
      clearCountByStage: {
        blackcity_lab: 1,
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
});
