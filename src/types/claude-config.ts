export type AgentDepartment =
  | "engineering"
  | "testing"
  | "design"
  | "product"
  | "marketing"
  | "studio-operations"
  | "project-management"
  | "bonus";

export interface AgentEntry {
  name: string;
  file: string;
  source: "core" | "community" | "project";
  source_repo?: string;
  department: AgentDepartment;
  description: string;
  model_tier: "haiku" | "sonnet" | "opus" | "custom";
  capabilities: string[];
  tools?: string[];
  teams?: string[];
}

export interface AgentCatalog {
  version: string;
  model_tiers: Record<string, { model: string; use_for: string }>;
  teams: Record<string, { description: string; agents: string[] }>;
  agents: AgentEntry[];
}

export interface CommandEntry {
  name: string;
  description: string;
  filePath: string;
}

export interface HookDefinition {
  type: "command" | "prompt";
  command?: string;
  prompt?: string;
  timeout?: number;
  async?: boolean;
}

export interface HookGroup {
  matcher?: string;
  hooks: HookDefinition[];
}

export interface ClaudeSettings {
  env: Record<string, string>;
  permissions: {
    allow: string[];
    deny: string[];
  };
  hooks: Record<string, HookGroup[]>;
}

export interface StackTemplate {
  name: string;
  description: string;
  short_label: string;
  init_commands: string[];
  directories: string[];
  commands: Record<string, string>;
}
