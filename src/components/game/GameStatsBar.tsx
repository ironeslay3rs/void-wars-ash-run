import { UPGRADE_CATALOG } from "@/features/game/gameActions";
import type { GameState } from "@/features/game/gameTypes";

export function GameStatsBar({ state }: { state: GameState }) {
  const rows = [
    { label: "Day", value: state.day },
    { label: "Health", value: `${Math.max(0, Math.round(state.health))}/${state.maxHealth}` },
    { label: "Hunger", value: `${Math.round(state.hunger)}/100` },
    { label: "Stress", value: `${Math.round(state.stress)}/100` },
    { label: "Credits", value: `${state.credits} cr` },
    { label: "Scrap", value: `${state.scrap}` },
  ];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="mb-3 text-[11px] text-zinc-500">
        Win: <span className="text-zinc-400">day {state.victoryTargetDay}</span>{" "}
        {state.victoryTargetDay === 15 ? "(sprint)" : "(month)"}
        {state.creditsWinTarget != null ? (
          <>
            {" "}
            or <span className="text-zinc-400">{state.creditsWinTarget} cr</span>
          </>
        ) : null}
        .
        {state.ironman ? (
          <>
            {" "}
            <span className="text-amber-200/80">Iron</span> — no clinic.
          </>
        ) : null}{" "}
        Fence &amp; services skip the day. At{" "}
        <span className="text-zinc-400">100 stress</span> you meltdown (−HP/cr/scrap,
        2-day cooldown).
      </p>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              {r.label}
            </dt>
            <dd className="font-mono text-sm text-zinc-100">{r.value}</dd>
          </div>
        ))}
      </dl>
      {state.installedUpgrades.length > 0 ? (
        <div className="mt-3 border-t border-zinc-800 pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Installed
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {state.installedUpgrades.map((id) => (
              <li
                key={id}
                className="rounded border border-emerald-900/60 bg-emerald-950/35 px-2 py-0.5 text-[11px] text-emerald-200/90"
              >
                {UPGRADE_CATALOG[id].name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
