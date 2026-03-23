import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { GhostConfig } from "@/types/pipeline";

export function useGhostConfig() {
  return useQuery({
    queryKey: ["ghost-config"],
    queryFn: () =>
      invoke<GhostConfig>("read_ghost_config", {
        claudeDir: "~/.claude",
      }).catch(() => null),
    staleTime: Infinity,
  });
}
