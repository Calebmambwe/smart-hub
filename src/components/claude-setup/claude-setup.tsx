import { useState } from "react";
import { cn } from "@/lib/utils";
import { AgentBrowser } from "./agent-browser";
import { CommandBrowser } from "./command-browser";

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
    <div className="flex h-full flex-col space-y-4 overflow-hidden">
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
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={cn(
              "px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === tab.id
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {activeTab === "agents" && <AgentBrowser />}
        {activeTab === "commands" && <CommandBrowser />}
        {(activeTab === "settings" ||
          activeTab === "stacks" ||
          activeTab === "rules" ||
          activeTab === "hooks") && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              {activeTab === "settings" &&
                "Settings viewer — environment variables, permissions, and hooks."}
              {activeTab === "stacks" &&
                "Stack template gallery — 16 templates for scaffolding new projects."}
              {activeTab === "rules" &&
                "Rule viewer — 13 path-scoped rule files governing behavior."}
              {activeTab === "hooks" &&
                "Hook viewer — 12 lifecycle shell hooks for automation."}
            </p>
            <p className="mt-2 text-xs italic text-muted-foreground">
              Full implementation coming in a future milestone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
