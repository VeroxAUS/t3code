export interface TurnUsageSnapshot {
  readonly usageStatus: "complete" | "partial" | "unavailable";
  readonly inputTokens?: number | undefined;
  readonly cachedInputTokens?: number | undefined;
  readonly cacheCreationTokens?: number | undefined;
  readonly outputTokens?: number | undefined;
  readonly reasoningTokens?: number | undefined;
}

export interface UsdRatesPerMillion {
  readonly input: number;
  readonly cacheRead: number;
  readonly cacheWrite: number;
  readonly output: number;
}

interface DisjointBuckets {
  readonly uncachedInput: number;
  readonly cacheRead: number;
  readonly cacheWrite: number;
  readonly output: number;
}

interface TurnCost {
  readonly buckets: DisjointBuckets | null;
  readonly complete: boolean;
  readonly priced: boolean;
  readonly usdEquivalent: number | null;
  readonly issue:
    | "inconsistent-counters"
    | "missing-counters"
    | "unpriced"
    | "invalid-rates"
    | null;
}

// Accept inclusive cumulative turn totals; adapters must establish known cache zeros explicitly.
export function priceTurnUsage(
  usage: TurnUsageSnapshot,
  rates: UsdRatesPerMillion | null,
): TurnCost {
  const {
    inputTokens: input,
    cachedInputTokens: read,
    cacheCreationTokens: write,
    outputTokens: output,
    reasoningTokens: reasoning,
  } = usage;
  const unknownCost = (issue: TurnCost["issue"]): TurnCost => ({
    buckets: null,
    complete: false,
    priced: false,
    usdEquivalent: null,
    issue,
  });
  const counters = [input, read, write, output, reasoning];
  if (
    counters.some((count) => count !== undefined && (!Number.isSafeInteger(count) || count < 0)) ||
    (input !== undefined &&
      ((read ?? 0) > input ||
        (write ?? 0) > input ||
        (read !== undefined && write !== undefined && read > input - write))) ||
    (reasoning !== undefined && output !== undefined && reasoning > output)
  )
    return unknownCost("inconsistent-counters");
  if (
    usage.usageStatus === "unavailable" ||
    input === undefined ||
    read === undefined ||
    write === undefined ||
    output === undefined
  )
    return unknownCost("missing-counters");

  const buckets = {
    uncachedInput: input - read - write,
    cacheRead: read,
    cacheWrite: write,
    output,
  };
  const result = { buckets, complete: usage.usageStatus === "complete" };
  if (rates === null) return { ...result, priced: false, usdEquivalent: null, issue: "unpriced" };
  const rateValues = [rates.input, rates.cacheRead, rates.cacheWrite, rates.output];
  if (rateValues.some((rate) => !Number.isFinite(rate) || rate < 0))
    return { ...result, priced: false, usdEquivalent: null, issue: "invalid-rates" };
  const usdEquivalent =
    (buckets.uncachedInput * rates.input +
      read * rates.cacheRead +
      write * rates.cacheWrite +
      output * rates.output) /
    1_000_000;
  if (!Number.isFinite(usdEquivalent))
    return { ...result, priced: false, usdEquivalent: null, issue: "invalid-rates" };
  return { ...result, priced: true, usdEquivalent, issue: null };
}
