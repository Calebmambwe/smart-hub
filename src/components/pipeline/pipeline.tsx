import { useState } from "react";
import { cn } from "@/lib/utils";
import { TaskBoard } from "./task-board";
import { GhostRunCard } from "./ghost-run-card";
import { MetricsDashboard } from "./metrics-dashboard";
import { PRTracker } from "./pr-tracker";

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
        {activeTab === "progress" && <GhostRunCard />}
        {activeTab === "metrics" && <MetricsDashboard />}
        {activeTab === "prs" && <PRTracker />}
      </div>
    </div>
  );
}
