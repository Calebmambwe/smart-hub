import { useState } from "react";
import { cn } from "@/lib/utils";
import { DaemonPanel } from "./daemon-panel";

type Tab = "daemons" | "audit-log" | "rag-search" | "file-stats";

export function SmartDesk() {
  const [activeTab, setActiveTab] = useState<Tab>("daemons");

  const tabs: { id: Tab; label: string }[] = [
    { id: "daemons", label: "Daemons" },
    { id: "audit-log", label: "Audit Log" },
    { id: "rag-search", label: "RAG Search" },
    { id: "file-stats", label: "File Stats" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Smart Desk</h2>
        <p className="text-muted-foreground">
          Monitor daemons, browse audit log, and search your files.
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
        {activeTab === "daemons" && <DaemonPanel />}

        {activeTab === "audit-log" && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Audit log viewer — streaming 81MB JSONL with search and action filtering.
            </p>
            <p className="mt-2 text-xs text-muted-foreground italic">
              Full implementation coming in Milestone 4.
            </p>
          </div>
        )}

        {activeTab === "rag-search" && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              RAG search — hybrid keyword + semantic search across indexed files.
            </p>
            <p className="mt-2 text-xs text-muted-foreground italic">
              Full implementation coming in Milestone 4.
            </p>
          </div>
        )}

        {activeTab === "file-stats" && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              File organization stats — moves by category, duplicate detection results.
            </p>
            <p className="mt-2 text-xs text-muted-foreground italic">
              Full implementation coming in Milestone 4.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
