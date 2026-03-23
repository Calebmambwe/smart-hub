import { useMetrics } from "@/hooks/use-metrics";
import type { MetricsEvent } from "@/types/pipeline";

function OutcomeBadge({ outcome }: { outcome: MetricsEvent["outcome"] }) {
  const styles: Record<MetricsEvent["outcome"], string> = {
    merged:
      "bg-green-500/15 text-green-400 ring-1 ring-green-500/30",
    blocked:
      "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    failed:
      "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[outcome] ?? styles.failed}`}
    >
      {outcome}
    </span>
  );
}

function ActivityRow({ event }: { event: MetricsEvent }) {
  const date = new Date(event.timestamp);
  const relativeTime = formatRelative(date);

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground truncate">
            {event.job_id}
          </span>
          <OutcomeBadge outcome={event.outcome} />
        </div>
        <p className="mt-0.5 text-sm font-medium truncate">{event.feature}</p>
        <p className="text-xs text-muted-foreground truncate">{event.project}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums">
          {event.total_minutes}
          <span className="text-xs font-normal text-muted-foreground ml-1">min</span>
        </p>
        <p className="text-xs text-muted-foreground">{relativeTime}</p>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading activity feed" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex justify-between gap-4 py-3 border-b border-border last:border-0">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted/50 animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted/50 animate-pulse" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-12 rounded bg-muted/50 animate-pulse ml-auto" />
            <div className="h-3 w-16 rounded bg-muted/50 animate-pulse ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed() {
  const { data, isLoading, isError } = useMetrics();

  const recent = data?.slice(-20).reverse() ?? [];

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="mb-4 font-semibold text-base">Activity Feed</h3>

      {isLoading && <ActivityFeedSkeleton />}

      {isError && (
        <p className="text-sm text-muted-foreground">
          Could not load metrics.
        </p>
      )}

      {!isLoading && !isError && recent.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No pipeline events recorded yet. Run{" "}
          <code className="font-mono text-xs bg-muted rounded px-1">/auto-dev</code>{" "}
          to generate activity.
        </p>
      )}

      {!isLoading && !isError && recent.length > 0 && (
        <div>
          {recent.map((event) => (
            <ActivityRow key={event.job_id + event.timestamp} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- helpers ----------------------------------------------------------------

function formatRelative(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
