import { useStacks } from "@/hooks/use-stacks";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function StackGallerySkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading stacks"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stack card
// ---------------------------------------------------------------------------

const COMMAND_PRIORITY = ["dev", "start", "build", "test", "lint", "typecheck"];

interface StackCardProps {
  name: string;
  description: string;
  short_label: string;
  commands: Record<string, string>;
}

function StackCard({ name, description, short_label, commands }: StackCardProps) {
  // Sort commands: priority first, then alphabetical
  const commandEntries = Object.entries(commands).sort(([a], [b]) => {
    const ai = COMMAND_PRIORITY.indexOf(a);
    const bi = COMMAND_PRIORITY.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">{name}</h3>
        <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {short_label}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {description}
      </p>

      {commandEntries.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Commands
          </p>
          <div className="flex flex-col gap-px">
            {commandEntries.slice(0, 5).map(([cmd, script]) => (
              <div key={cmd} className="flex items-center gap-2 overflow-hidden">
                <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-px font-mono text-xs text-foreground">
                  {cmd}
                </span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {script}
                </span>
              </div>
            ))}
            {commandEntries.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{commandEntries.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function StackGallery() {
  const { data: stacks, isLoading, isError, error } = useStacks();

  if (isLoading) {
    return <StackGallerySkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="font-medium">Failed to load stacks</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const allStacks = stacks ?? [];

  if (allStacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm font-medium">No stacks found</p>
        <p className="text-xs text-muted-foreground">
          Stack templates will appear here once configured.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {allStacks.length} stack template{allStacks.length !== 1 ? "s" : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allStacks.map((stack) => (
          <StackCard
            key={stack.name}
            name={stack.name}
            description={stack.description}
            short_label={stack.short_label}
            commands={stack.commands}
          />
        ))}
      </div>
    </div>
  );
}
