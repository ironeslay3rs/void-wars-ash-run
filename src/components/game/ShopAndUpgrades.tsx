import {
  CLINIC_REPAIR_COST,
  CLINIC_REPAIR_HP_BONUS,
  INTEL_COST,
  SHOP_FOOD_COST,
  SHOP_MEDICINE_COST,
  UPGRADE_CATALOG,
} from "@/features/game/gameActions";
import type { GameAction, GameState, UpgradeId } from "@/features/game/gameTypes";

const MINI =
  "rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-left text-sm text-zinc-100 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40";

export function ShopAndUpgrades({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const foodOk = state.credits >= SHOP_FOOD_COST;
  const medOk = state.credits >= SHOP_MEDICINE_COST;
  const intelOk = state.credits >= INTEL_COST;
  const clinicOk =
    state.credits >= CLINIC_REPAIR_COST &&
    !state.bodyRepairUsed &&
    !state.ironman;
  const locked = state.gameOver || state.victory;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Shop{" "}
          <span className="font-normal text-zinc-600">· keys 5–6</span>
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className={MINI}
            disabled={!foodOk || locked}
            onClick={() => dispatch({ type: "buy_food" })}
          >
            <kbd className="mr-1 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              5
            </kbd>
            Buy food — {SHOP_FOOD_COST} cr
          </button>
          <button
            type="button"
            className={MINI}
            disabled={!medOk || locked}
            onClick={() => dispatch({ type: "buy_medicine" })}
          >
            <kbd className="mr-1 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              6
            </kbd>
            Buy medicine — {SHOP_MEDICINE_COST} cr
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Services{" "}
          <span className="font-normal text-zinc-600">· keys 8–9 · no day</span>
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className={MINI}
            disabled={!intelOk || locked}
            onClick={() => dispatch({ type: "buy_intel" })}
          >
            <kbd className="mr-1 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              8
            </kbd>
            Buy intel — {INTEL_COST} cr
            <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">
              Flavor hint for next fight (RNG unchanged)
            </span>
          </button>
          <button
            type="button"
            className={MINI}
            disabled={!clinicOk || locked}
            onClick={() => dispatch({ type: "buy_clinic_repair" })}
          >
            <kbd className="mr-1 rounded border border-zinc-600 px-1 font-mono text-[10px] text-zinc-400">
              9
            </kbd>
            Clinic repair — {CLINIC_REPAIR_COST} cr
            <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">
              {state.ironman
                ? "Unavailable — iron run"
                : `Once: +${CLINIC_REPAIR_HP_BONUS} max HP & heal`}
            </span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Installs (once each)
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {(Object.keys(UPGRADE_CATALOG) as UpgradeId[]).map((id) => {
            const u = UPGRADE_CATALOG[id];
            const owned = state.installedUpgrades.includes(id);
            const afford = state.credits >= u.cost;
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`${MINI} flex w-full flex-col sm:flex-row sm:items-center sm:justify-between`}
                  disabled={owned || !afford || locked}
                  onClick={() => dispatch({ type: "buy_upgrade", upgradeId: id })}
                >
                  <span>
                    <span className="font-medium">{u.name}</span>{" "}
                    <span className="text-zinc-500">— {u.cost} cr</span>
                  </span>
                  <span className="mt-1 text-xs text-zinc-400 sm:mt-0">
                    {owned ? "Installed" : u.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
