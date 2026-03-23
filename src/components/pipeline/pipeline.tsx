import { useState } from "react";
import { cn } from "@/lib/utils";
import { TaskBoard } from "./task-board";

type Tab = "tasks" | "progress" | "metrics" | "prs";

export function Pipeline() {
  const [activeTab, setActiveTab] = useState<Tab>("tasks");

  const tabs: { id: Tab; label: string }[] = [
    { id: "tasks", label: "Task Board" },
    { id: "progress", label: "Pipeline" },
    { id: "metrics", label: "Metrics" },
    { id: "prs", label: "PRs" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pipeline</h2>
        <p className="text-muted-foreground">
          Mission control for autonomous development pipelines.
        </p>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "tasks" && <TaskBoard />}

        {activeTab === "progress" && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Pipeline progress — /auto-dev, /ghost-run status and progress bars.
            </p>
            <p className="mt-2 text-xs text-muted-foreground italic">
              Full implementation coming in Milestone 5.
            </p>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Metrics dashboard — cost, duration, success rates from metrics.jsonl.
            </p>
            <p className="mt-2 text-xs text-muted-foreground italic">
              Full implementation coming in Milestone 5.
            </p>
          </div>
        )}

        {activeTab === "prs" && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              PR tracker — open pull requests with check status from gh CLI.
            </p>
            <p className="mt-2 text-xs text-muted-foreground italic">
              Full implementation coming in Milestone 5.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
