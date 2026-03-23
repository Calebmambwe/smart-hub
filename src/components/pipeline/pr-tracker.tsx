import { cn } from "@/lib/utils";
import { usePRs } from "@/hooks/use-prs";
import type { PullRequest } from "@/hooks/use-prs";

// ── state badge ───────────────────────────────────────────────────────────────

interface StateBadgeProps {
  state: string;
}

function StateBadge({ state }: StateBadgeProps) {
  const upper = state.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold",
        upper === "OPEN" &&
          "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
        upper === "MERGED" &&
          "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
        upper === "CLOSED" &&
          "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        upper !== "OPEN" &&
          upper !== "MERGED" &&
          upper !== "CLOSED" &&
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {upper}
    </span>
  );
}

// ── table row ─────────────────────────────────────────────────────────────────

interface PRRowProps {
  pr: PullRequest;
}

function PRRow({ pr }: PRRowProps) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/40 transition-colors">
      <td className="py-2.5 pl-4 pr-3 text-xs font-mono text-muted-foreground tabular-nums">
        #{pr.number}
      </td>
      <td className="py-2.5 px-3 text-sm font-medium max-w-xs truncate">
        {pr.title}
      </td>
      <td className="py-2.5 px-3 text-xs font-mono text-muted-foreground max-w-[180px] truncate">
        {pr.head_branch}
      </td>
      <td className="py-2.5 pl-3 pr-4">
        <StateBadge state={pr.state} />
      </td>
    </tr>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function PRTracker() {
  const { data, isLoading, error } = usePRs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading pull requests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        Could not fetch PRs. Is <code className="font-mono">gh</code> CLI
        installed?
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center space-y-1">
        <p className="text-sm font-medium">No open pull requests</p>
        <p className="text-xs text-muted-foreground">
          Open PRs will appear here once the{" "}
          <code className="font-mono">gh</code> CLI reports them.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <p className="text-sm font-semibold">
          Pull Requests{" "}
          <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-bold tabular-nums">
            {data.length}
          </span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="py-2 pl-4 pr-3 text-left text-xs font-semibold text-muted-foreground">
                #
              </th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground">
                Title
              </th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground">
                Branch
              </th>
              <th className="py-2 pl-3 pr-4 text-left text-xs font-semibold text-muted-foreground">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((pr) => (
              <PRRow key={pr.number} pr={pr} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
