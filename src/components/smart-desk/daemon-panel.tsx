import { cn } from "@/lib/utils";
import { useDaemonStatus } from "@/hooks/use-daemon-status";
import type { DaemonStatus } from "@/types/smart-desk";

interface StatusBadgeProps {
  status: DaemonStatus["status"];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const isRunning = status === "running";
  const isError = status === "error";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        isRunning && "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
        isError && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        !isRunning && !isError && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      {/* Status dot */}
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isRunning && "bg-green-500 dark:bg-green-400",
          isError && "bg-red-500 dark:bg-red-400",
          !isRunning && !isError && "bg-red-400 dark:bg-red-500",
        )}
      />
      {isRunning ? "Running" : isError ? "Error" : "Stopped"}
    </span>
  );
}

export function DaemonPanel() {
  const { data, isLoading, error } = useDaemonStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Checking daemon status…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        Failed to fetch daemon status: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No daemons registered.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Name
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Label
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              PID
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((daemon, index) => (
            <tr
              key={daemon.name}
              className={cn(
                "border-b last:border-b-0 transition-colors hover:bg-muted/30",
                index % 2 === 0 ? "bg-card" : "bg-muted/10",
              )}
            >
              <td className="px-4 py-3 font-medium">{daemon.name}</td>
              <td className="px-4 py-3">
                <code className="font-mono text-xs text-muted-foreground">
                  {daemon.label}
                </code>
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {daemon.pid !== null ? daemon.pid : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={daemon.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
