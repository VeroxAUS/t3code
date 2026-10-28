import { useAtomValue } from "@effect/atom-react";
import type { EnvironmentId } from "@t3tools/contracts";
import {
  collectLimitAccounts,
  collectLimitPools,
  displayLimitWindows,
  formatDuration,
  type LimitPool,
} from "@t3tools/shared/usageLimits";
import { useEffect, useMemo, useState } from "react";

import { primaryServerConfigAtom } from "../../state/server";
import { providerClients } from "../settings/providerDriverMeta";
import { barColor } from "../usage/UsageLimits";

const SHORT_LABEL = { session: "Session", weekly: "Week" } as const;
const LOW_REMAINING_PERCENT = 20;

function StripWindow({
  window,
  color,
  now,
}: {
  readonly window: LimitPool["windows"][number];
  readonly color: string;
  readonly now: number;
}) {
  const nextReset = Math.min(...window.resets.map((reset) => reset.at));
  const low = window.remainingPercent <= LOW_REMAINING_PERCENT;
  return (
    <span className="flex items-center gap-1.5">
      {SHORT_LABEL[window.kind as keyof typeof SHORT_LABEL]}
      <span className="h-1.5 w-9 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${window.remainingPercent}%`,
            backgroundColor: low ? "var(--warning)" : color,
          }}
        />
      </span>
      {/* Both providers show quota left, so every number falls as you use more. */}
      <span className={low ? "text-warning" : undefined}>
        <span
          className={low ? "font-medium tabular-nums" : "font-medium text-foreground tabular-nums"}
        >
          {window.remainingPercent}%
        </span>{" "}
        left
      </span>
      {Number.isFinite(nextReset) ? <span>{formatDuration(nextReset - now)}</span> : null}
    </span>
  );
}

// shortcut: primary environment only and one fixed wide layout; add resizing and
// other environments once the placement is agreed.
export function UsageStrip({ environmentId }: { readonly environmentId: EnvironmentId }) {
  const serverConfig = useAtomValue(primaryServerConfigAtom);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const pools = useMemo(
    () =>
      serverConfig
        ? collectLimitPools(
            collectLimitAccounts(
              new Map([[environmentId, { entry: { target: { label: "" } }, serverConfig }]]),
            ),
            now,
          )
        : [],
    [serverConfig, environmentId, now],
  );
  if (pools.length === 0) return null;
  return (
    <div
      data-usage-strip="true"
      className="mb-1 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-border/60 px-3 py-1.5 text-xs text-muted-foreground"
    >
      {pools.map((pool) => {
        const windows = displayLimitWindows(pool);
        const shown = (["session", "weekly"] as const).flatMap((kind) => {
          const first = windows.find((window) => window.kind === kind);
          return first ? [first] : [];
        });
        if (shown.length === 0) return null;
        const color = barColor(pool.driver);
        return (
          <span key={pool.driver} className="flex items-center gap-3">
            <span className="font-medium text-foreground">
              {providerClients.get(pool.driver)?.label ?? String(pool.driver)}
            </span>
            {shown.map((window) => (
              <StripWindow key={window.id} window={window} color={color} now={now} />
            ))}
          </span>
        );
      })}
    </div>
  );
}
