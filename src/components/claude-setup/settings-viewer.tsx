import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import type { HookGroup } from "@/types/claude-config";

// ---------------------------------------------------------------------------
// Collapsible section wrapper
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, count, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
          aria-hidden
        />
        <span className="text-sm font-medium">{title}</span>
        {count !== undefined && (
          <span className="ml-1 text-xs text-muted-foreground">({count})</span>
        )}
      </button>
      {open && <div className="border-t">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Environment variables table
// ---------------------------------------------------------------------------

interface EnvTableProps {
  env: Record<string, string>;
}

function EnvTable({ env }: EnvTableProps) {
  const entries = Object.entries(env);

  if (entries.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        No environment variables defined.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="w-1/3 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Key
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b last:border-0 hover:bg-accent/30">
              <td className="px-4 py-2 font-mono text-xs font-medium">{key}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground break-all">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Permissions columns
// ---------------------------------------------------------------------------

interface PermissionsProps {
  allow: string[];
  deny: string[];
}

function Permissions({ allow, deny }: PermissionsProps) {
  if (allow.length === 0 && deny.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        No permissions configured.
      </p>
    );
  }

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Allow
        </p>
        {allow.length === 0 ? (
          <p className="text-xs text-muted-foreground">None</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {allow.map((pattern) => (
              <span
                key={pattern}
                className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-400"
              >
                {pattern}
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Deny
        </p>
        {deny.length === 0 ? (
          <p className="text-xs text-muted-foreground">None</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {deny.map((pattern) => (
              <span
                key={pattern}
                className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-xs text-red-400"
              >
                {pattern}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hooks grouped by event
// ---------------------------------------------------------------------------

interface HooksTreeProps {
  hooks: Record<string, HookGroup[]>;
}

function HooksTree({ hooks }: HooksTreeProps) {
  const events = Object.entries(hooks);

  if (events.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        No hooks configured.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {events.map(([event, groups]) => (
        <div key={event} className="px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {event}
          </p>
          <div className="flex flex-col gap-2">
            {groups.map((group, gi) => (
              <div
                key={gi}
                className="rounded-md border bg-muted/20 px-3 py-2 text-xs"
              >
                {group.matcher && (
                  <p className="mb-1.5 font-mono text-muted-foreground">
                    matcher:{" "}
                    <span className="text-foreground">{group.matcher}</span>
                  </p>
                )}
                {group.hooks.map((h, hi) => (
                  <div key={hi} className="flex items-start gap-2">
                    <span className="shrink-0 rounded border border-border bg-muted px-1 py-px font-mono text-muted-foreground">
                      {h.type}
                    </span>
                    <span className="break-all font-mono text-foreground">
                      {h.command ?? h.prompt ?? "—"}
                    </span>
                    {h.timeout !== undefined && (
                      <span className="ml-auto shrink-0 text-muted-foreground">
                        {h.timeout}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SettingsViewerSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      aria-busy="true"
      aria-label="Loading settings"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="border-t p-4">
            <div className="h-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function SettingsViewer() {
  const { data: settings, isLoading, isError, error } = useSettings();

  if (isLoading) {
    return <SettingsViewerSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="font-medium">Failed to load settings</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const envCount = Object.keys(settings.env).length;
  const hookEventCount = Object.keys(settings.hooks).length;

  return (
    <div className="flex flex-col gap-3">
      <Section
        title="Environment Variables"
        count={envCount}
        defaultOpen
      >
        <EnvTable env={settings.env} />
      </Section>

      <Section
        title="Permissions"
        count={settings.permissions.allow.length + settings.permissions.deny.length}
        defaultOpen
      >
        <Permissions
          allow={settings.permissions.allow}
          deny={settings.permissions.deny}
        />
      </Section>

      <Section
        title="Hooks"
        count={hookEventCount}
        defaultOpen={false}
      >
        <HooksTree hooks={settings.hooks} />
      </Section>
    </div>
  );
}
