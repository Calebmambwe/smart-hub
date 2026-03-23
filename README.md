# Smart Hub

Unified command center for Claude Code setup, Smart Desk daemons, and development pipelines. Built with Tauri 2.0.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop runtime | Tauri 2.0 |
| Backend | Rust + Tokio |
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS 3 |
| Server state | TanStack Query v5 |
| Charts | Recharts v2 |
| File watching | notify-rs v6 |

## Features

- **Claude Setup Browser** — view agents, commands, stacks, rules, hooks, and settings
- **Pipeline Dashboard** — track tasks, ghost runs, metrics, and open PRs
- **Smart Desk Monitor** — daemon status and audit log viewer
- **Live Updates** — file watcher invalidates cached data on config changes

## Architecture

All filesystem I/O goes through Rust `#[tauri::command]` functions. The React frontend never touches the filesystem directly. File changes are detected by `notify-rs` and emitted as Tauri events, triggering TanStack Query cache invalidation.

## Development

```bash
# Install dependencies
pnpm install

# Run in development (frontend + Rust)
cargo tauri dev

# Frontend only (no Rust backend)
pnpm dev

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Production build
cargo tauri build
```

## Project Structure

```
src/                    # React frontend
  components/           # UI components by feature area
  hooks/                # TanStack Query hooks (all wired to Rust)
  types/                # TypeScript type definitions
src-tauri/              # Rust backend
  src/commands/         # Tauri command handlers
  src/error.rs          # AppError enum
  src/utils.rs          # Shared utilities (expand_home)
  src/watcher.rs        # File change watcher
```
