import { describe, expect, it } from "vitest";
import { baseBpmForZone, biomeFor, BIOMES } from "./zone-biomes";

describe("AR-2.5 zone biomes", () => {
  it("every zone has a biome entry", () => {
    expect(BIOMES.length).toBeGreaterThanOrEqual(9);
  });

  it("BPMs match the canonical spec", () => {
    expect(baseBpmForZone("lab_containment")).toBe(80);
    expect(baseBpmForZone("blackcity_outskirts")).toBe(120);
    expect(baseBpmForZone("verdant_coil_entry")).toBe(100);
    expect(baseBpmForZone("chrome_synod_entry")).toBe(140);
    expect(baseBpmForZone("ember_vault_entry")).toBe(90);
  });

  it("Deep Lab is shifting — bpm range spans all empire extremes", () => {
    const b = biomeFor("deep_lab_return").bpm;
    expect(b.kind).toBe("shifting");
    if (b.kind === "shifting") {
      expect(b.minBpm).toBeLessThanOrEqual(80);
      expect(b.maxBpm).toBeGreaterThanOrEqual(140);
    }
  });

  it("Black City is chaotic — bpm shifts 100–140", () => {
    const b = biomeFor("blackcity_outskirts").bpm;
    expect(b.kind).toBe("shifting");
    if (b.kind === "shifting") {
      expect(b.minBpm).toBe(100);
      expect(b.maxBpm).toBe(140);
    }
  });
});
