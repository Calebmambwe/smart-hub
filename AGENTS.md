# Smart Hub — Project Learnings

## Stack
- Tauri 2.0 (Rust 1.94) + React 19 + TypeScript + Vite 6 + Tailwind CSS
- TanStack Query (server state) + Zustand (UI state)
- notify-rs for file watching, tokio for async Rust

## Gotchas Discovered During Build

### Rust / Tauri
- **AppError must impl Into<InvokeError>**: Tauri 2.0 command errors need `serde::Serialize` on the error type. The simplest pattern is a tagged enum with `#[serde(tag = "kind", content = "message")]`.
- **No `tray-icon` feature needed for basic builds**: Remove from Cargo.toml `tauri` features unless you're actually using system tray (Milestone 6).
- **Placeholder icons required at build time**: `tauri::generate_context!()` fails without valid PNG files in `src-tauri/icons/`. The `build.rs` generates minimal RGBA PNGs to avoid this.
- **`expand_home` is needed everywhere**: Tauri commands receive paths as strings from the frontend. Always use the `expand_home()` helper to resolve `~` — Rust's `PathBuf::from("~")` does NOT expand home directory.
- **`dirs` crate**: Use `dirs::home_dir()` not `std::env::var("HOME")` for cross-platform compatibility.
- **Unused variants need `#[allow(dead_code)]`**: Rust warns on enum variants not yet constructed (e.g., `AppError::Shell` before shell commands are wired).

### Frontend / React
- **`staleTime: Infinity` is critical**: All TanStack Query hooks must use this — the file watcher handles invalidation via `file-changed` events, not polling.
- **Query key naming must match `PATH_TO_QUERY_MAP`**: The file watcher in `use-file-watcher.ts` maps filenames to query keys. New hooks must register their query keys there or they won't auto-refresh.
- **`@tanstack/react-virtual` conditional usage**: Only activate virtualization above 50 items. Below that, a simple `.map()` avoids unnecessary DOM complexity.
- **Ghost config can legitimately not exist**: The `useGhostConfig` hook uses `.catch(() => null)` because `ghost-config.json` is absent between ghost runs. This is not an error state.

### Data Sources
- **Audit log is 81MB**: NEVER read fully into memory from Rust. Use `tail_audit_log` with pagination. The current implementation reads from end of file — will need memory-mapped I/O for production.
- **`catalog.json` has nested structure**: The `agents` array is nested under a top-level object that also contains `model_tiers` and `teams`. Parse the top-level Value first, then extract `.agents`.
- **Command frontmatter is minimal**: Only `name` and `description` fields. The body after `---` is the command instruction prose.
- **`metrics.jsonl` uses JSONL format**: One JSON object per line. Use `serde_json::from_str` per line with `filter_map` to skip malformed lines gracefully.

## Conventions Established
- Rust command names: `snake_case` (maps to `camelCase` in TS via Tauri's automatic conversion — but we use snake_case in invoke calls)
- All file I/O through Rust commands — React never imports `fs` or `path`
- Loading states: shimmer bars (animate-pulse), not spinners
- Error states: muted text with descriptive message, not red alerts
- Badge colors use opacity modifiers (`/15`, `/30`) for light+dark theme compatibility
