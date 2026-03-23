import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { AgentCatalog } from "@/types/claude-config";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () =>
      invoke<AgentCatalog>("list_agents", {
        configDir: "~/.claude-super-setup",
      }),
    staleTime: Infinity,
  });
}
