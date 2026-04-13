import { describe, expect, it } from "vitest";
import {
  DEFAULT_ASSIST,
  isAnyAssistOn,
  compositeScore,
  rankFor,
  rhythmAccuracy,
  type ZoneRunStats,
} from "./assist-mode";

/**
 * AR-2.3 assist + rank — story path open to all, S-rank reserved for
 * no-assist precision clears.
 */

function stats(over: Partial<ZoneRunStats> = {}): ZoneRunStats {
  return {
    timeMs: 60_000,
    parTimeMs: 60_000,
    gradeCounts: { perfect: 90, good: 8, ok: 1, off: 1 },
    secretsFound: 10,
    secretsTotal: 10,
    anyAssistUsed: false,
    deaths: 0,
    ...over,
  };
}

describe("assist toggles", () => {
  it("default assist = everything off", () => {
    expect(isAnyAssistOn(DEFAULT_ASSIST)).toBe(false);
  });

  it("any single toggle flips isAnyAssistOn", () => {
    expect(isAnyAssistOn({ ...DEFAULT_ASSIST, extraDash: true })).toBe(true);
    expect(isAnyAssistOn({ ...DEFAULT_ASSIST, gameSpeed: 0.8 })).toBe(true);
    expect(isAnyAssistOn({ ...DEFAULT_ASSIST, invincible: true })).toBe(true);
  });
});

describe("rank scoring", () => {
  it("no-assist + par time + perfect rhythm + all secrets = S", () => {
    expect(rankFor(stats())).toBe("S");
  });

  it("assist on never grants S — caps at A", () => {
    expect(rankFor(stats({ anyAssistUsed: true }))).toBe("A");
  });

  it("rhythm accuracy counts perfect + good only", () => {
    const acc = rhythmAccuracy(
      stats({ gradeCounts: { perfect: 50, good: 50, ok: 0, off: 0 } }),
    );
    expect(acc).toBeCloseTo(1);
    const mid = rhythmAccuracy(
      stats({ gradeCounts: { perfect: 0, good: 0, ok: 50, off: 50 } }),
    );
    expect(mid).toBe(0);
  });

  it("composite score is monotonic in time, rhythm, secrets", () => {
    const base = compositeScore(stats());
    const slower = compositeScore(stats({ timeMs: 120_000 }));
    const fewerSecrets = compositeScore(
      stats({ secretsFound: 0, secretsTotal: 10 }),
    );
    expect(slower).toBeLessThan(base);
    expect(fewerSecrets).toBeLessThan(base);
  });

  it("weak run still earns at least D — story never locks", () => {
    const bad = stats({
      timeMs: 600_000,
      gradeCounts: { perfect: 0, good: 0, ok: 0, off: 500 },
      secretsFound: 0,
      anyAssistUsed: true,
      deaths: 200,
    });
    expect(rankFor(bad)).toBe("D");
  });
});
