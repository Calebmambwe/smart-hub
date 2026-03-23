import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "agents" | "commands" | "settings" | "stacks" | "rules" | "hooks";

export function ClaudeSetup() {
  const [activeTab, setActiveTab] = useState<Tab>("agents");

  const tabs: { id: Tab; label: string }[] = [
    { id: "agents", label: "Agents" },
    { id: "commands", label: "Commands" },
    { id: "settings", label: "Settings" },
    { id: "stacks", label: "Stacks" },
    { id: "rules", label: "Rules" },
    { id: "hooks", label: "Hooks" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Claude Setup</h2>
        <p className="text-muted-foreground">
          Browse and manage your Claude Code configuration.
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
          {activeTab === "agents" && "Agent browser — 60+ agents across 8 departments. Search, filter, and view details."}
          {activeTab === "commands" && "Command browser — 80+ slash commands with descriptions and usage."}
          {activeTab === "settings" && "Settings viewer — environment variables, permissions, and hooks."}
          {activeTab === "stacks" && "Stack template gallery — 16 templates for scaffolding new projects."}
          {activeTab === "rules" && "Rule viewer — 13 path-scoped rule files governing behavior."}
          {activeTab === "hooks" && "Hook viewer — 12 lifecycle shell hooks for automation."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground italic">
          Full implementation coming in Milestone 3.
        </p>
      </div>
    </div>
  );
}
