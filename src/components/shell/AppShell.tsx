"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Studio" },
  { href: "/survivor", label: "Survivor" },
  { href: "/ash-run", label: "Ash Run" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className="flex min-h-full flex-col text-zinc-100"
      style={{
        backgroundColor: "var(--studio-surface)",
        color: "var(--foreground)",
      }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-sm"
        style={{
          borderColor: "var(--studio-border)",
          backgroundColor: "color-mix(in srgb, var(--studio-surface) 92%, transparent)",
        }}
      >
        <nav
          className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-3 sm:gap-2"
          aria-label="Main"
        >
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--studio-surface-elevated)] text-[var(--studio-accent)]"
                    : "text-[var(--studio-muted)] hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
