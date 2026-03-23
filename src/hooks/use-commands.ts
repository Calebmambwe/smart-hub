import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { CommandEntry } from "@/types/claude-config";

export function useCommands() {
  return useQuery({
    queryKey: ["commands"],
    queryFn: () =>
      invoke<CommandEntry[]>("list_commands", {
        configDir: "~/.claude-super-setup",
      }),
    staleTime: Infinity,
  });
}
