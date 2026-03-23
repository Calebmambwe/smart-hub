import { useState } from "react";
import { cn } from "@/lib/utils";

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

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {activeTab === "tasks" && "Task board — kanban view of tasks.json with status columns."}
          {activeTab === "progress" && "Pipeline progress — /auto-dev, /ghost-run status and progress bars."}
          {activeTab === "metrics" && "Metrics dashboard — cost, duration, success rates from metrics.jsonl."}
          {activeTab === "prs" && "PR tracker — open pull requests with check status from gh CLI."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground italic">
          Full implementation coming in Milestone 5.
        </p>
      </div>
    </div>
  );
}
