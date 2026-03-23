import { cn } from "@/lib/utils";
import { useGhostConfig } from "@/hooks/use-ghost-config";
import type { GhostConfig } from "@/types/pipeline";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── trust badge ───────────────────────────────────────────────────────────────

interface TrustBadgeProps {
  trust: GhostConfig["trust"];
}

function TrustBadge({ trust }: TrustBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold capitalize",
        trust === "aggressive" &&
          "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        trust === "balanced" &&
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
        trust === "conservative" &&
          "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
      )}
    >
      {trust}
    </span>
  );
}

// ── status badge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const lower = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs font-semibold capitalize",
        lower === "running" &&
          "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
        lower === "complete" &&
          "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
        lower === "blocked" &&
          "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        lower === "pending" &&
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        lower !== "running" &&
          lower !== "complete" &&
          lower !== "blocked" &&
          lower !== "pending" &&
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {lower === "running" && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      {status}
    </span>
  );
}

// ── stat row ──────────────────────────────────────────────────────────────────

interface StatRowProps {
  label: string;
  value: string | number;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function GhostRunCard() {
  const { data, isLoading, error } = useGhostConfig();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading ghost run...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        Failed to load ghost config: {(error as Error).message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center space-y-1">
        <p className="text-sm font-medium">No ghost run configured</p>
        <p className="text-xs text-muted-foreground">
          Start one with <code className="font-mono">/ghost-run</code> to see
          its status here.
        </p>
      </div>
    );
  }

  const isComplete = data.status.toLowerCase() === "complete";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
            Ghost Run
          </p>
          <p className="text-base font-semibold leading-tight truncate">
            {data.feature}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {data.project_dir}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <TrustBadge trust={data.trust} />
          <StatusBadge status={data.status} />
        </div>
      </div>

      {/* Timestamps */}
      <div className="space-y-1">
        {data.started_at && (
          <StatRow label="Started" value={formatTimestamp(data.started_at)} />
        )}
        {data.completed_at && (
          <StatRow
            label="Completed"
            value={formatTimestamp(data.completed_at)}
          />
        )}
      </div>

      {/* Completion stats */}
      {isComplete && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Results
          </p>
          {data.files_changed !== undefined && (
            <StatRow label="Files changed" value={data.files_changed} />
          )}
          {data.lines_added !== undefined && (
            <StatRow
              label="Lines added"
              value={`+${data.lines_added}`}
            />
          )}
          {data.lines_removed !== undefined && (
            <StatRow
              label="Lines removed"
              value={`-${data.lines_removed}`}
            />
          )}
          {data.tests_passed !== undefined && (
            <StatRow
              label="Tests passed"
              value={
                data.tests_failed !== undefined
                  ? `${data.tests_passed} / ${data.tests_passed + data.tests_failed}`
                  : data.tests_passed
              }
            />
          )}
          {data.typescript_new_errors !== undefined && (
            <StatRow
              label="TS new errors"
              value={data.typescript_new_errors}
            />
          )}
        </div>
      )}

      {/* Max tasks note */}
      <p className="text-xs text-muted-foreground">
        Max tasks: <span className="font-medium">{data.max_tasks}</span>
      </p>
    </div>
  );
}
