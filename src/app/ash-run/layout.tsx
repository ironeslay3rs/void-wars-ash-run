import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Void Wars: Ash Run",
  description:
    "Ash escapes the Blackcity lab in an Oblivion-rooted 2D action platformer stage board.",
};

export default function AshRunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
