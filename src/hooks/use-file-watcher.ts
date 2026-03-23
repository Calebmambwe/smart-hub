import { listen } from "@tauri-apps/api/event";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface FileEvent {
  path: string;
  kind: string;
}

const PATH_TO_QUERY_MAP: Record<string, string[]> = {
  "catalog.json": ["agents"],
  "settings.json": ["settings"],
  "tasks.json": ["tasks"],
  "metrics.jsonl": ["metrics"],
  "ghost-config.json": ["ghost-config"],
  "audit_log.jsonl": ["audit-log"],
};

export function useFileWatcher() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    listen<FileEvent>("file-changed", (event) => {
      const filename = event.payload.path.split("/").pop() ?? "";
      const queryKeys = PATH_TO_QUERY_MAP[filename];
      if (queryKeys) {
        queryKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        );
      }
    }).then((fn) => {
      unlisten = fn;
    });

    return () => unlisten?.();
  }, [queryClient]);
}
