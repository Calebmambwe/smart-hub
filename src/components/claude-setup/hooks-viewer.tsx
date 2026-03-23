import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useHooks } from "@/hooks/use-hooks";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function HooksViewerSkeleton() {
  return (
    <div
      className="rounded-lg border"
      aria-busy="true"
      aria-label="Loading hooks"
    >
      <div className="flex flex-col gap-2 border-b p-3">
        <div className="h-8 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 border-b px-4 py-3 last:border-0">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          <div className="h-3 w-64 animate-pulse rounded bg-muted" />
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function HooksViewer() {
  const { data: hooks, isLoading, isError, error } = useHooks();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!hooks) return [];
    const query = search.toLowerCase();
    if (query === "") return hooks;
    return hooks.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.description.toLowerCase().includes(query) ||
        h.file_path.toLowerCase().includes(query),
    );
  }, [hooks, search]);

  if (isLoading) {
    return <HooksViewerSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="font-medium">Failed to load hooks</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const allHooks = hooks ?? [];

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
            placeholder="Search hooks…"
            aria-label="Search hooks by name, description, or path"
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {allHooks.length} hook{allHooks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Hook list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm font-medium">No hooks match your search</p>
          <p className="text-xs text-muted-foreground">Try a different keyword.</p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((hook) => (
            <div
              key={hook.file_path}
              className="flex flex-col gap-1 px-4 py-3 hover:bg-accent/30"
            >
              <p className="text-sm font-medium">{hook.name}</p>
              {hook.description && (
                <p className="text-xs text-muted-foreground">{hook.description}</p>
              )}
              <p className="font-mono text-xs text-muted-foreground">
                {hook.file_path}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
