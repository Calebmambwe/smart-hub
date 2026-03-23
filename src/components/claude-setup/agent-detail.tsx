import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentEntry, AgentDepartment } from "@/types/claude-config";

interface AgentDetailProps {
  agent: AgentEntry;
  onClose: () => void;
}

const DEPARTMENT_COLORS: Record<AgentDepartment, string> = {
  engineering: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  testing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  design: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  product: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  marketing: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "studio-operations": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "project-management": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  bonus: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

const MODEL_TIER_COLORS: Record<string, string> = {
  haiku: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  sonnet: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  opus: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  custom: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const deptColor = DEPARTMENT_COLORS[agent.department] ?? "bg-muted text-muted-foreground border-border";
  const tierColor = MODEL_TIER_COLORS[agent.model_tier] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="flex h-full flex-col border-l bg-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight">{agent.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                deptColor,
              )}
            >
              {agent.department}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                tierColor,
              )}
            >
              {agent.model_tier}
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {agent.source}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Description */}
        <section>
          <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Description
          </h4>
          <p className="text-sm leading-relaxed">{agent.description}</p>
        </section>

        {/* Capabilities */}
        {agent.capabilities.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Capabilities
            </h4>
            <ul className="space-y-1">
              {agent.capabilities.map((cap) => (
                <li key={cap} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tools */}
        {agent.tools && agent.tools.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Teams */}
        {agent.teams && agent.teams.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Teams
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.teams.map((team) => (
                <span
                  key={team}
                  className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {team}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Source file */}
        <section>
          <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Source File
          </h4>
          <p className="break-all font-mono text-xs text-muted-foreground">
            {agent.file}
          </p>
        </section>
      </div>
    </div>
  );
}
