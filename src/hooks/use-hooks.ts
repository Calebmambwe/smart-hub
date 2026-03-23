import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { HookEntry } from "@/types/claude-config";

export function useHooks() {
  return useQuery({
    queryKey: ["hooks"],
    queryFn: () =>
      invoke<HookEntry[]>("list_hooks", {
        configDir: "~/.claude-super-setup",
      }),
    staleTime: Infinity,
  });
}
