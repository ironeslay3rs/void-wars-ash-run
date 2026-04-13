import Link from "next/link";
import { hubTagline } from "@/lib/canon-lore";

export default function StudioHubPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Local · no backend
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
          Game Studio
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400">
          Two prototypes in one repo — pick a mode. Saves stay in your browser.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-zinc-500">
          {hubTagline}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/survivor"
          className="group flex flex-col rounded-xl border bg-[var(--studio-surface-elevated)]/80 p-6 transition hover:border-[color:var(--studio-accent-dim)]"
          style={{ borderColor: "var(--studio-border)" }}
        >
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--studio-accent-dim)" }}
          >
            Survival
          </span>
          <span className="mt-2 text-lg font-semibold text-zinc-100 group-hover:text-[color:var(--studio-accent)]">
            Black Market Survivor
          </span>
          <span className="mt-2 text-sm text-zinc-400">
            Meltdown, fence, intel — month, sprint, iron, or heist (400 / 250 / 175 cr).
          </span>
          <span
            className="mt-4 text-sm font-medium"
            style={{ color: "var(--studio-accent)" }}
          >
            Play →
          </span>
        </Link>

        <Link
          href="/ash-run"
          className="group flex flex-col rounded-xl border bg-[var(--studio-surface-elevated)]/80 p-6 transition hover:border-[color:var(--studio-accent-dim)]"
          style={{ borderColor: "var(--studio-border)" }}
        >
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--studio-accent-dim)" }}
          >
            Action folio
          </span>
          <span className="mt-2 text-lg font-semibold text-zinc-100 group-hover:text-[color:var(--studio-accent)]">
            Void Wars: Ash Run
          </span>
          <span className="mt-2 text-sm text-zinc-400">
            Folios I–XXXVII + roadmap XXXVIII — map, PB pace, linear unlocks.
          </span>
          <span
            className="mt-4 text-sm font-medium"
            style={{ color: "var(--studio-accent)" }}
          >
            Play →
          </span>
        </Link>
      </div>
    </div>
  );
}
