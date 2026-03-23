# Smart Hub — Project Instructions

## What This Is
Tauri 2.0 desktop app (Rust + React/TypeScript) — unified command center for Claude Code setup, Smart Desk, and development pipelines.

## Stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Rust (Tauri 2.0 commands)
- **State:** TanStack Query (server state) + Zustand (UI state)
- **Routing:** TanStack Router
- **File watching:** notify-rs via Rust, events emitted to frontend

## Architecture
- All I/O goes through Rust `#[tauri::command]` functions — no direct filesystem access from React
- Frontend calls Rust via `invoke<T>('command_name', { args })` from `@tauri-apps/api/core`
- File changes detected by notify-rs → emitted as `file-changed` events → TanStack Query cache invalidation
- All Rust commands return `Result<T, AppError>` — AppError is a tagged enum

## Conventions
- Rust files: snake_case (`claude_config.rs`)
- TS files: kebab-case (`agent-browser.tsx`)
- Components: PascalCase (`AgentBrowser`)
- Hooks: `use` prefix (`useAgents`)
- All errors through `AppError` enum (io, parse, notFound, shell)

## External Data Sources (read-only)
- `~/.claude-super-setup/` — agents, commands, rules, hooks, settings, stacks
- `~/.claude/` — metrics.jsonl, ghost-config.json, plans/
- `~/smart-desk/` — MCP servers, daemons, config, tasks.json
- `~/.smart-desk/` — audit_log.jsonl (81MB), fts.db, chroma/

## Commands
```bash
pnpm dev              # Vite dev server only
cargo tauri dev       # Full app (frontend + Rust)
cargo tauri build     # Production .app bundle
pnpm typecheck        # TypeScript checking
cargo clippy          # Rust linting
cargo test            # Rust tests
```

## Critical Rules
- NEVER import fs/path modules in React — all file I/O through Rust commands
- NEVER read the full 81MB audit log into memory — use streaming/pagination
- NEVER modify files in ~/.claude/ or ~/smart-desk/ without explicit user action
- Use `expand_home()` for all path resolution in Rust
- Use `staleTime: Infinity` for TanStack Query — rely on file-changed events for refetching
