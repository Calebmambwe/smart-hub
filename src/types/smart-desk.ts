export interface AuditEntry {
  id: string;
  timestamp: string;
  action: "move" | "delete" | "suspend" | "resume" | "sync" | "clear_cache" | "index";
  source: string | null;
  destination: string | null;
  metadata: Record<string, unknown>;
  reversible: boolean;
  reversed: boolean;
  reversed_by: string | null;
}

export interface DaemonStatus {
  name: string;
  pid: number | null;
  status: "running" | "stopped" | "error";
  label: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_mb: number;
  status: string;
  create_time: number;
  username: string;
  is_protected: boolean;
}

export interface SystemResources {
  cpu_percent: number;
  cpu_count: number;
  memory_total_gb: number;
  memory_used_gb: number;
  memory_percent: number;
  disk_total_gb: number;
  disk_used_gb: number;
  disk_percent: number;
  top_cpu_processes: ProcessInfo[];
  top_memory_processes: ProcessInfo[];
}

export interface SearchResult {
  path: string;
  score: number;
  excerpt: string;
  match_type: "keyword" | "semantic" | "hybrid";
}
