import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { ClaudeSettings } from "@/types/claude-config";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () =>
      invoke<ClaudeSettings>("read_settings", {
        configDir: "~/.claude-super-setup",
      }),
    staleTime: Infinity,
  });
}
