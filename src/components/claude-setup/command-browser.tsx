import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommands } from "@/hooks/use-commands";

export function CommandBrowser() {
  const { data: commands, isLoading, isError, error } = useCommands();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!commands) return [];
    const query = search.toLowerCase();
    if (query === "") return commands;
    return commands.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query),
    );
  }, [commands, search]);

  if (isLoading) {
    return <CommandBrowserSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="font-medium">Failed to load commands</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const allCommands = commands ?? [];

  return (
    <div className="flex flex-col rounded-lg border">
      {/* Controls */}
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
            placeholder="Search commands…"
            aria-label="Search commands by name or description"
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {allCommands.length} command{allCommands.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[minmax(140px,_auto)_1fr] gap-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span>Command</span>
        <span>Description</span>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm font-medium">No commands match your search</p>
          <p className="text-xs text-muted-foreground">Try a different keyword.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filtered.map((cmd) => (
            <div
              key={cmd.name}
              className={cn(
                "grid grid-cols-[minmax(140px,_auto)_1fr] gap-4 border-b px-4 py-2.5 transition-colors hover:bg-accent",
              )}
            >
              <span className="truncate font-mono text-sm font-medium">
                {cmd.name}
              </span>
              <span className="line-clamp-2 text-sm text-muted-foreground">
                {cmd.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommandBrowserSkeleton() {
  return (
    <div className="rounded-lg border" aria-busy="true" aria-label="Loading commands">
      <div className="flex flex-col gap-2 border-b p-3">
        <div className="h-8 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-[minmax(140px,_auto)_1fr] gap-4 border-b bg-muted/50 px-4 py-2">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(140px,_auto)_1fr] gap-4 border-b px-4 py-2.5"
        >
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
