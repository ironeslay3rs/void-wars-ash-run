export function GameLog({ lines }: { lines: string[] }) {
  const shown = lines.slice(-24);
  return (
    <section className="flex min-h-[200px] flex-col rounded-lg border border-zinc-800 bg-zinc-950/50">
      <h2 className="border-b border-zinc-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Log
      </h2>
      <ul
        className="max-h-[320px] overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-400"
        aria-live="polite"
      >
        {shown.map((line, i) => (
          <li key={`${i}-${line.slice(0, 24)}`} className="border-b border-zinc-800/50 py-1.5 last:border-0">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
