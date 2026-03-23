export interface Task {
  id: number;
  title: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  priority: "P0" | "P1" | "P2";
  risk: "low" | "medium" | "high";
  depends_on: number[];
  acceptance: string[];
  files: string[];
  attempts: number;
  max_attempts: number;
}

export interface TasksFile {
  project: string;
  stack: string;
  tasks: Task[];
}

export interface MetricsEvent {
  timestamp: string;
  job_id: string;
  event: "job_complete";
  project: string;
  feature: string;
  phases: {
    spec_minutes: number;
    plan_minutes: number;
    implement_minutes: number;
    verify_minutes: number;
    review_minutes: number;
  };
  agents_used: number;
  worktrees_used: number;
  rework_count: number;
  model_cost_usd: number;
  ci_minutes: number;
  human_minutes: number;
  total_minutes: number;
  outcome: "merged" | "blocked" | "failed";
}

export interface GhostConfig {
  feature: string;
  trust: "conservative" | "balanced" | "aggressive";
  max_tasks: number;
  project_dir: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  pr_url?: string;
  files_changed?: number;
  lines_added?: number;
  lines_removed?: number;
  tests_passed?: number;
  tests_failed?: number;
  typescript_new_errors?: number;
}
