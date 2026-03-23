import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { DaemonStatus } from "@/types/smart-desk";

export function useDaemonStatus() {
  return useQuery({
    queryKey: ["daemon-status"],
    queryFn: () => invoke<DaemonStatus[]>("get_daemon_status"),
    staleTime: Infinity,
  });
}
