import { cn } from "@/lib/utils";
import type { Task } from "@/types/pipeline";

interface PriorityBadgeProps {
  priority: Task["priority"];
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold",
        priority === "P0" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        priority === "P1" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
        priority === "P2" && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {priority}
    </span>
  );
}

interface RiskBadgeProps {
  risk: Task["risk"];
}

function RiskBadge({ risk }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium capitalize",
        risk === "high" && "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        risk === "medium" && "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
        risk === "low" && "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      )}
    >
      {risk}
    </span>
  );
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm space-y-2">
      {/* Title */}
      <p className="text-sm font-medium leading-snug">{task.title}</p>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <PriorityBadge priority={task.priority} />
        <RiskBadge risk={task.risk} />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {task.files.length > 0 ? (
          <span>{task.files.length} file{task.files.length !== 1 ? "s" : ""}</span>
        ) : (
          <span />
        )}

        {task.attempts > 0 && (
          <span className="tabular-nums">
            {task.attempts}/{task.max_attempts} attempts
          </span>
        )}
      </div>
    </div>
  );
}
