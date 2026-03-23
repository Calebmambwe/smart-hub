import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { TasksFile } from "@/types/pipeline";

async function fetchTasks(projectDir: string): Promise<TasksFile | null> {
  try {
    return await invoke<TasksFile>("read_tasks", { projectDir });
  } catch (err: unknown) {
    // Graceful fallback when tasks.json doesn't exist
    if (
      typeof err === "string" &&
      (err.includes("not found") || err.includes("NotFound"))
    ) {
      return null;
    }
    if (
      err !== null &&
      typeof err === "object" &&
      "NotFound" in err
    ) {
      return null;
    }
    throw err;
  }
}

export function useTasks(projectDir = "~/.claude-super-setup") {
  return useQuery<TasksFile | null, Error>({
    queryKey: ["tasks", projectDir],
    queryFn: () => fetchTasks(projectDir),
    staleTime: Infinity,
  });
}
