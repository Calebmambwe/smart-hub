import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { GhostConfig } from "@/types/pipeline";

export function Dashboard() {
  const ghostQuery = useQuery({
    queryKey: ["ghost-config"],
    queryFn: () =>
      invoke<GhostConfig>("read_ghost_config", {
        claudeDir: "~/.claude",
      }).catch(() => null),
    staleTime: Infinity,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of all systems at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Agents"
          value="60+"
          description="Active agent definitions"
        />
        <StatusCard
          title="Commands"
          value="80+"
          description="Available slash commands"
        />
        <StatusCard
          title="Ghost Mode"
          value={ghostQuery.data?.status ?? "unknown"}
          description={ghostQuery.data?.feature ?? "No active run"}
        />
        <StatusCard
          title="Stack Templates"
          value="16"
          description="Ready to scaffold"
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {["/auto-dev", "/check", "/ship", "/ghost", "/plan"].map((cmd) => (
            <button
              key={cmd}
              className="rounded-md border bg-secondary px-3 py-1.5 text-sm font-mono hover:bg-accent transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Activity Feed</h3>
        <p className="text-sm text-muted-foreground">
          Live activity will appear here once file watchers are connected.
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
