import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/use-agents";
import { AgentDetail } from "./agent-detail";
import type { AgentEntry, AgentDepartment } from "@/types/claude-config";

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

const VIRTUALIZE_THRESHOLD = 50;

export function AgentBrowser() {
  const { data: catalog, isLoading, isError, error } = useAgents();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<AgentEntry | null>(null);

  const agents = catalog?.agents ?? [];

  const departments = useMemo<string[]>(() => {
    const seen = new Set<string>();
    for (const a of agents) seen.add(a.department);
    return Array.from(seen).sort();
  }, [agents]);

  const modelTiers = useMemo<string[]>(() => {
    const seen = new Set<string>();
    for (const a of agents) seen.add(a.model_tier);
    return Array.from(seen).sort();
  }, [agents]);

  const filtered = useMemo<AgentEntry[]>(() => {
    const query = search.toLowerCase();
    return agents.filter((a) => {
      const matchesSearch =
        query === "" ||
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query);
      const matchesDept = deptFilter === "all" || a.department === deptFilter;
      const matchesTier = tierFilter === "all" || a.model_tier === tierFilter;
      return matchesSearch && matchesDept && matchesTier;
    });
  }, [agents, search, deptFilter, tierFilter]);

  const shouldVirtualize = filtered.length > VIRTUALIZE_THRESHOLD;

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 68,
    overscan: 8,
    enabled: shouldVirtualize,
  });

  if (isLoading) {
    return <AgentBrowserSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="font-medium">Failed to load agents</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 gap-0 overflow-hidden rounded-lg border">
      {/* Left: list panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Controls */}
        <div className="flex flex-col gap-2 border-b p-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              strokeWidth={1.5}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents…"
              aria-label="Search agents by name or description"
              className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              aria-label="Filter by department"
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Filter by model tier"
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All tiers</option>
              {modelTiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm font-medium">No agents match your filters</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        ) : shouldVirtualize ? (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            style={{ contain: "strict" }}
          >
            <div
              style={{ height: virtualizer.getTotalSize(), position: "relative" }}
            >
              {virtualizer.getVirtualItems().map((vItem) => {
                const agent = filtered[vItem.index];
                return (
                  <div
                    key={vItem.key}
                    data-index={vItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vItem.start}px)`,
                    }}
                  >
                    <AgentRow
                      agent={agent}
                      isSelected={selectedAgent?.name === agent.name}
                      onSelect={setSelectedAgent}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filtered.map((agent) => (
              <AgentRow
                key={agent.name}
                agent={agent}
                isSelected={selectedAgent?.name === agent.name}
                onSelect={setSelectedAgent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      {selectedAgent && (
        <div className="w-72 shrink-0 xl:w-80">
          <AgentDetail
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
          />
        </div>
      )}
    </div>
  );
}

interface AgentRowProps {
  agent: AgentEntry;
  isSelected: boolean;
  onSelect: (agent: AgentEntry) => void;
}

function AgentRow({ agent, isSelected, onSelect }: AgentRowProps) {
  const deptColor =
    DEPARTMENT_COLORS[agent.department] ??
    "bg-muted text-muted-foreground border-border";
  const tierColor =
    MODEL_TIER_COLORS[agent.model_tier] ??
    "bg-muted text-muted-foreground border-border";

  return (
    <button
      onClick={() => onSelect(agent)}
      aria-pressed={isSelected}
      className={cn(
        "flex w-full flex-col gap-1 border-b px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        isSelected && "bg-accent",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate text-sm font-medium">{agent.name}</span>
        <div className="ml-auto flex shrink-0 gap-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-1.5 py-px text-xs font-medium",
              deptColor,
            )}
          >
            {agent.department}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-1.5 py-px text-xs font-medium",
              tierColor,
            )}
          >
            {agent.model_tier}
          </span>
        </div>
      </div>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {agent.description}
      </p>
    </button>
  );
}

function AgentBrowserSkeleton() {
  return (
    <div className="rounded-lg border" aria-busy="true" aria-label="Loading agents">
      {/* Controls skeleton */}
      <div className="flex flex-col gap-2 border-b p-3">
        <div className="h-8 animate-pulse rounded-md bg-muted" />
        <div className="flex gap-2">
          <div className="h-7 flex-1 animate-pulse rounded-md bg-muted" />
          <div className="h-7 flex-1 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5 border-b px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="ml-auto flex gap-1">
              <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-14 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
          <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
