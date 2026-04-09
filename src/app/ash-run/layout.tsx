import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Void Wars: Ash Run",
  description:
    "Ash escapes the Blackcity lab — 2D action platformer vertical slice.",
};

export default function AshRunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
