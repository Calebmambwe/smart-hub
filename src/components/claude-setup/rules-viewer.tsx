import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useRules } from "@/hooks/use-rules";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function RulesViewerSkeleton() {
  return (
    <div
      className="rounded-lg border"
      aria-busy="true"
      aria-label="Loading rules"
    >
      <div className="flex flex-col gap-2 border-b p-3">
        <div className="h-8 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 border-b px-4 py-3 last:border-0">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-56 animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function RulesViewer() {
  const { data: rules, isLoading, isError, error } = useRules();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!rules) return [];
    const query = search.toLowerCase();
    if (query === "") return rules;
    return rules.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.file_path.toLowerCase().includes(query) ||
        r.preview.toLowerCase().includes(query),
    );
  }, [rules, search]);

  if (isLoading) {
    return <RulesViewerSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="font-medium">Failed to load rules</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const allRules = rules ?? [];

  return (
    <div className="flex flex-col rounded-lg border">
      {/* Search + count */}
      <div className="flex flex-col gap-2 border-b p-3">
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
            placeholder="Search rules…"
            aria-label="Search rules by name, path, or content"
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {allRules.length} rule{allRules.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Rule list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm font-medium">No rules match your search</p>
          <p className="text-xs text-muted-foreground">Try a different keyword.</p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((rule) => (
            <div
              key={rule.file_path}
              className="flex flex-col gap-1.5 px-4 py-3 hover:bg-accent/30"
            >
              <p className="text-sm font-medium">{rule.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {rule.file_path}
              </p>
              {rule.preview && (
                <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {rule.preview}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
