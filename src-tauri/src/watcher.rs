use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};

pub struct WatcherState(Mutex<Option<RecommendedWatcher>>);

impl WatcherState {
    pub fn new() -> Self {
        Self(Mutex::new(None))
    }
}

#[derive(Serialize, Clone)]
pub struct FileEvent {
    pub path: String,
    pub kind: String,
}

pub fn start_watchers(app: &AppHandle) {
    let app_handle = app.clone();
    let (tx, rx) = std::sync::mpsc::channel();

    let mut watcher = match RecommendedWatcher::new(tx, Config::default()) {
        Ok(w) => w,
        Err(e) => {
            eprintln!("Failed to create file watcher: {e}");
            return;
        }
    };

    // Watch critical config/state files
    let home = dirs::home_dir().unwrap_or_default();
    let watch_paths = [
        home.join(".claude-super-setup/config/settings.json"),
        home.join(".claude-super-setup/agents/catalog.json"),
        home.join(".claude/metrics.jsonl"),
        home.join(".claude/ghost-config.json"),
        home.join(".smart-desk/audit_log.jsonl"),
    ];

    for path in &watch_paths {
        if path.exists() {
            if let Err(e) = watcher.watch(path, RecursiveMode::NonRecursive) {
                eprintln!("Failed to watch {}: {e}", path.display());
            }
        }
    }

    // Store watcher in state to keep it alive
    if let Ok(mut guard) = app.state::<WatcherState>().0.lock() {
        *guard = Some(watcher);
    }

    // Forward file events to frontend
    std::thread::spawn(move || {
        for result in rx {
            match result {
                Ok(event) => {
                    let payload = FileEvent {
                        path: event
                            .paths
                            .first()
                            .map(|p| p.display().to_string())
                            .unwrap_or_default(),
                        kind: format!("{:?}", event.kind),
                    };
                    let _ = app_handle.emit("file-changed", payload);
                }
                Err(e) => eprintln!("Watch error: {e:?}"),
            }
        }
    });
}
