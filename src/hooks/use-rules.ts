import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { RuleEntry } from "@/types/claude-config";

export function useRules() {
  return useQuery({
    queryKey: ["rules"],
    queryFn: () =>
      invoke<RuleEntry[]>("list_rules", {
        configDir: "~/.claude-super-setup",
      }),
    staleTime: Infinity,
  });
}
