import { describe, expect, it } from "vite-plus/test";

import { priceTurnUsage, type TurnUsageSnapshot } from "./costs.ts";

// Synthetic USD per million tokens, pinned for arithmetic, not vendor billing rates.
const rates = { input: 2, cacheRead: 0.2, cacheWrite: 2.5, output: 10 };
const usage = {
  usageStatus: "complete",
  inputTokens: 1_000,
  cachedInputTokens: 300,
  cacheCreationTokens: 200,
  outputTokens: 100,
  reasoningTokens: 40,
} as const;

describe("priceTurnUsage", () => {
  it.each([
    {
      provider: "live Claude Haiku 5.5, 2026-10-30",
      inputTokens: 26617,
      cachedInputTokens: 12941,
      cacheCreationTokens: 13674,
      outputTokens: 15,
      usd: 0.0369272,
    },
    {
      provider: "live Codex Luna, 2026-10-30",
      inputTokens: 21097,
      cachedInputTokens: 11648,
      cacheCreationTokens: 0,
      outputTokens: 8,
      usd: 0.0213076,
    },
    {
      provider: "Claude recorded multi_turn fixture",
      inputTokens: 11795,
      cachedInputTokens: 9455,
      cacheCreationTokens: 2337,
      outputTokens: 7,
      usd: 0.0078095,
    },
    {
      provider: "Codex recorded multi_turn fixture, first response",
      inputTokens: 21418,
      cachedInputTokens: 6912,
      cacheCreationTokens: 0,
      outputTokens: 8,
      usd: 0.0304744,
    },
    {
      provider: "OpenCode 2 synthetic adapter fixture",
      inputTokens: 4000,
      cachedInputTokens: 300,
      cacheCreationTokens: 2500,
      outputTokens: 40,
      usd: 0.00911,
    },
  ])("prices $provider at the synthetic pinned rates", ({ usd, ...snapshot }) => {
    expect(
      priceTurnUsage({ ...snapshot, usageStatus: "complete" }, rates).usdEquivalent,
    ).toBeCloseTo(usd, 12);
  });

  it("prices disjoint cache buckets and includes reasoning exactly once", () => {
    const cost = priceTurnUsage(usage, rates);
    expect(cost.buckets).toEqual({
      uncachedInput: 500,
      cacheRead: 300,
      cacheWrite: 200,
      output: 100,
    });
    // 500*2 + 300*0.2 + 200*2.5 + 100*10 = 2560 millionths of USD.
    expect(cost.usdEquivalent).toBeCloseTo(0.00256, 12);
    expect(cost.complete).toBe(true);
  });

  it("prices the latest cumulative snapshot independently, including duplicates and corrections", () => {
    const snapshots = [
      { ...usage, outputTokens: 80 },
      usage,
      usage,
      { ...usage, outputTokens: 90 },
    ];
    expect(snapshots.map((snapshot) => priceTurnUsage(snapshot, rates).usdEquivalent)).toEqual([
      0.00236, 0.00256, 0.00256, 0.00246,
    ]);
  });

  it("distinguishes known zero from unavailable or missing counters", () => {
    expect(priceTurnUsage({ usageStatus: "unavailable" }, rates).usdEquivalent).toBeNull();
    expect(
      priceTurnUsage({ ...usage, cachedInputTokens: undefined }, rates).usdEquivalent,
    ).toBeNull();
    expect(
      priceTurnUsage({ ...usage, cacheCreationTokens: undefined }, rates).usdEquivalent,
    ).toBeNull();
    expect(priceTurnUsage({ ...usage, inputTokens: undefined }, rates).usdEquivalent).toBeNull();
    expect(priceTurnUsage({ ...usage, outputTokens: undefined }, rates).usdEquivalent).toBeNull();
    expect(
      priceTurnUsage({ ...usage, usageStatus: "unavailable" }, rates).usdEquivalent,
    ).toBeNull();
    expect(
      priceTurnUsage(
        {
          ...usage,
          inputTokens: 0,
          cachedInputTokens: 0,
          cacheCreationTokens: 0,
          outputTokens: 0,
          reasoningTokens: 0,
        },
        rates,
      ).usdEquivalent,
    ).toBe(0);
  });

  it("keeps a fully observed partial snapshot provisional", () => {
    const cost = priceTurnUsage({ ...usage, usageStatus: "partial" }, rates);
    expect(cost.usdEquivalent).toBeCloseTo(0.00256, 12);
    expect(cost.complete).toBe(false);
    expect(
      priceTurnUsage({ usageStatus: "partial", inputTokens: 100 }, rates).usdEquivalent,
    ).toBeNull();
  });

  it("keeps tokens when the model is unpriced", () => {
    const cost = priceTurnUsage(usage, null);
    expect(cost.buckets?.uncachedInput).toBe(500);
    expect(cost.complete).toBe(true);
    expect(cost.priced).toBe(false);
    expect(cost.usdEquivalent).toBeNull();
  });

  it("does not require a reasoning subset to price inclusive output", () => {
    expect(
      priceTurnUsage({ ...usage, reasoningTokens: undefined }, rates).usdEquivalent,
    ).toBeCloseTo(0.00256, 12);
  });

  it.each([
    { cachedInputTokens: 900, cacheCreationTokens: 200 },
    { reasoningTokens: 101 },
    { inputTokens: -1 },
    { outputTokens: 1.5 },
    { cachedInputTokens: Number.NaN },
    { cacheCreationTokens: Infinity },
    { inputTokens: Number.MAX_SAFE_INTEGER + 1 },
  ])("rejects inconsistent counters %j without clamping", (patch) => {
    const cost = priceTurnUsage({ ...usage, ...patch } satisfies TurnUsageSnapshot, rates);
    expect(cost.issue).toBe("inconsistent-counters");
    expect(cost.usdEquivalent).toBeNull();
    expect(cost.complete).toBe(false);
  });

  it.each([-1, Number.NaN, Infinity])("rejects invalid pinned rates %s", (input) => {
    expect(priceTurnUsage(usage, { ...rates, input }).usdEquivalent).toBeNull();
  });

  it("accepts explicitly free rates and rejects overflow", () => {
    expect(
      priceTurnUsage(usage, { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }).usdEquivalent,
    ).toBe(0);
    expect(priceTurnUsage(usage, { ...rates, output: Number.MAX_VALUE }).usdEquivalent).toBeNull();
  });
});
