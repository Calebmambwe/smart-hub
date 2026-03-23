import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { StackTemplate } from "@/types/claude-config";

export function useStacks() {
  return useQuery({
    queryKey: ["stacks"],
    queryFn: () =>
      invoke<StackTemplate[]>("list_stacks", {
        configDir: "~/.claude-super-setup",
      }),
    staleTime: Infinity,
  });
}
