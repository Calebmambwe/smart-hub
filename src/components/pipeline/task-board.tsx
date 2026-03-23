import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { TaskCard } from "./task-card";
import type { Task } from "@/types/pipeline";

type ColumnStatus = Task["status"];

interface Column {
  id: ColumnStatus;
  label: string;
  headerClass: string;
  countClass: string;
}

const COLUMNS: Column[] = [
  {
    id: "pending",
    label: "Pending",
    headerClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    countClass: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  },
  {
    id: "in_progress",
    label: "In Progress",
    headerClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    countClass: "bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300",
  },
  {
    id: "completed",
    label: "Completed",
    headerClass: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    countClass: "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300",
  },
  {
    id: "failed",
    label: "Failed",
    headerClass: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    countClass: "bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300",
  },
];

export function TaskBoard() {
  const { data, isLoading, error } = useTasks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading tasks…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        Failed to load tasks: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center space-y-1">
        <p className="text-sm font-medium">No tasks.json found</p>
        <p className="text-xs text-muted-foreground">
          Run <code className="font-mono">/auto-plan</code> or{" "}
          <code className="font-mono">/auto-tasks</code> to generate a task list.
        </p>
      </div>
    );
  }

  const tasksByStatus = (status: ColumnStatus) =>
    data.tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-3">
      {/* Project meta */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{data.project}</span>
        <span>/</span>
        <span>{data.stack}</span>
        <span className="ml-auto">{data.tasks.length} total tasks</span>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-3">
        {COLUMNS.map((col) => {
          const tasks = tasksByStatus(col.id);
          return (
            <div key={col.id} className="flex flex-col gap-2">
              {/* Column header */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-1.5",
                  col.headerClass,
                )}
              >
                <span className="text-xs font-semibold">{col.label}</span>
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
                    col.countClass,
                  )}
                >
                  {tasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 min-h-[4rem]">
                {tasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                    Empty
                  </div>
                ) : (
                  tasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
