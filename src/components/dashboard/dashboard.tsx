import { useAgents } from "@/hooks/use-agents";
import { useCommands } from "@/hooks/use-commands";
import { useDaemonStatus } from "@/hooks/use-daemon-status";
import { useGhostConfig } from "@/hooks/use-ghost-config";
import { ActivityFeed } from "./activity-feed";

export function Dashboard() {
  const agentsQuery = useAgents();
  const commandsQuery = useCommands();
  const ghostQuery = useGhostConfig();
  const daemonQuery = useDaemonStatus();

  const runningDaemonCount =
    daemonQuery.data?.filter((d) => d.status === "running").length ?? 0;
  const totalDaemonCount = daemonQuery.data?.length ?? 0;
  const daemonValue = daemonQuery.isLoading
    ? "..."
    : daemonQuery.isError
      ? "Error"
      : `${runningDaemonCount}/${totalDaemonCount}`;
  const daemonDescription = daemonQuery.isError
    ? "Could not read daemon status"
    : `${runningDaemonCount} daemon${runningDaemonCount !== 1 ? "s" : ""} running`;

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
          value={
            agentsQuery.isLoading
              ? "..."
              : agentsQuery.isError
                ? "Error"
                : String(agentsQuery.data?.agents.length ?? 0)
          }
          description={
            agentsQuery.isError
              ? "Could not load catalog"
              : "Active agent definitions"
          }
          isError={agentsQuery.isError}
          isLoading={agentsQuery.isLoading}
        />
        <StatusCard
          title="Commands"
          value={
            commandsQuery.isLoading
              ? "..."
              : commandsQuery.isError
                ? "Error"
                : String(commandsQuery.data?.length ?? 0)
          }
          description={
            commandsQuery.isError
              ? "Could not load commands"
              : "Available slash commands"
          }
          isError={commandsQuery.isError}
          isLoading={commandsQuery.isLoading}
        />
        <StatusCard
          title="Ghost Mode"
          value={
            ghostQuery.isLoading
              ? "..."
              : ghostQuery.isError
                ? "Error"
                : (ghostQuery.data?.status ?? "inactive")
          }
          description={
            ghostQuery.isError
              ? "Could not read ghost config"
              : (ghostQuery.data?.feature ?? "No active run")
          }
          isError={ghostQuery.isError}
          isLoading={ghostQuery.isLoading}
        />
        <StatusCard
          title="Daemons"
          value={daemonValue}
          description={daemonDescription}
          isError={daemonQuery.isError}
          isLoading={daemonQuery.isLoading}
        />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-3 font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {["/auto-dev", "/check", "/ship", "/ghost", "/plan"].map((cmd) => (
            <button
              key={cmd}
              className="rounded-md border bg-secondary px-3 py-1.5 text-sm font-mono hover:bg-accent transition-colors focus-visible:ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
}

// ---- StatusCard -------------------------------------------------------------

interface StatusCardProps {
  title: string;
  value: string;
  description: string;
  isLoading?: boolean;
  isError?: boolean;
}

function StatusCard({
  title,
  value,
  description,
  isLoading = false,
  isError = false,
}: StatusCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>

      {isLoading ? (
        <>
          <div className="mt-1 h-8 w-16 rounded bg-muted/50 animate-pulse" aria-label="Loading" />
          <div className="mt-1.5 h-3 w-28 rounded bg-muted/50 animate-pulse" />
        </>
      ) : (
        <>
          <p
            className={`text-2xl font-bold ${isError ? "text-muted-foreground" : ""}`}
          >
            {value}
          </p>
          <p
            className={`text-xs ${isError ? "text-destructive/70" : "text-muted-foreground"}`}
          >
            {description}
          </p>
        </>
      )}
    </div>
  );
}
