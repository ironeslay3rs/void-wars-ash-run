import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Black Market Survivor",
  description:
    "Grey-market survival prototype — manage stats day by day; local save, no backend.",
};

export default function SurvivorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
