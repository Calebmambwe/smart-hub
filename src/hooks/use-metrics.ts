import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { MetricsEvent } from "@/types/pipeline";

export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: () =>
      invoke<MetricsEvent[]>("read_metrics", {
        metricsPath: "~/.claude/metrics.jsonl",
      }),
    staleTime: Infinity,
  });
}
