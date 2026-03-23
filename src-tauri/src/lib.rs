mod commands;
mod error;
mod watcher;

use watcher::WatcherState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(WatcherState::new())
        .setup(|app| {
            watcher::start_watchers(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::claude_config::list_agents,
            commands::claude_config::read_settings,
            commands::claude_config::list_commands,
            commands::pipeline::read_tasks,
            commands::pipeline::read_ghost_config,
            commands::pipeline::read_metrics,
            commands::smart_desk::get_daemon_status,
            commands::smart_desk::tail_audit_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running smart hub");
}
