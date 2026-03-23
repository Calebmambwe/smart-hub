import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useMetrics } from "@/hooks/use-metrics";
import type { MetricsEvent } from "@/types/pipeline";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

function formatMinutes(mins: number): string {
  return `${Math.round(mins)}m`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── sub-components ────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

interface CostChartProps {
  events: MetricsEvent[];
}

function CostChart({ events }: CostChartProps) {
  const data = events.map((e) => ({
    date: formatTimestamp(e.timestamp),
    cost: e.model_cost_usd,
  }));

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold">Cost Over Time</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            width={52}
          />
          <Tooltip
            formatter={(v: number) => [`$${v.toFixed(4)}`, "Cost"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="cost" fill="#6366f1" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const OUTCOME_COLORS: Record<MetricsEvent["outcome"], string> = {
  merged: "#22c55e",
  blocked: "#f97316",
  failed: "#ef4444",
};

interface OutcomeChartProps {
  events: MetricsEvent[];
}

function OutcomeChart({ events }: OutcomeChartProps) {
  const counts = events.reduce<Record<MetricsEvent["outcome"], number>>(
    (acc, e) => {
      acc[e.outcome] = (acc[e.outcome] ?? 0) + 1;
      return acc;
    },
    { merged: 0, blocked: 0, failed: 0 },
  );

  const data = (
    Object.entries(counts) as [MetricsEvent["outcome"], number][]
  )
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 flex items-center justify-center h-[260px]">
        <p className="text-sm text-muted-foreground">No outcome data</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold">Outcome Breakdown</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }: { name: string; value: number }) =>
              `${name} (${value})`
            }
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={OUTCOME_COLORS[entry.name as MetricsEvent["outcome"]]}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function MetricsDashboard() {
  const { data, isLoading, error } = useMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        Failed to load metrics: {(error as Error).message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center space-y-1">
        <p className="text-sm font-medium">No pipeline metrics recorded yet</p>
        <p className="text-xs text-muted-foreground">
          Metrics appear here after running{" "}
          <code className="font-mono">/auto-dev</code> or{" "}
          <code className="font-mono">/auto-ship</code>.
        </p>
      </div>
    );
  }

  const totalJobs = data.length;
  const totalCost = data.reduce((sum, e) => sum + e.model_cost_usd, 0);
  const avgMinutes =
    data.reduce((sum, e) => sum + e.total_minutes, 0) / totalJobs;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Jobs completed" value={String(totalJobs)} />
        <SummaryCard label="Total cost" value={formatCost(totalCost)} />
        <SummaryCard label="Avg duration" value={formatMinutes(avgMinutes)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <CostChart events={data} />
        <OutcomeChart events={data} />
      </div>
    </div>
  );
}
