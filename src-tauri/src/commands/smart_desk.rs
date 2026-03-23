use crate::error::AppError;
use crate::utils::expand_home;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct DaemonStatus {
    pub name: String,
    pub label: String,
    pub pid: Option<u32>,
    pub status: String, // "running" | "stopped" | "error"
}

#[tauri::command]
pub async fn get_daemon_status() -> Result<Vec<DaemonStatus>, AppError> {
    let daemons = vec![
        ("downloads_watcher", "com.smartdesk.downloads"),
        ("resource_monitor", "com.smartdesk.resources"),
    ];

    let mut results = Vec::new();

    for (name, label) in daemons {
        let output = tokio::process::Command::new("launchctl")
            .args(["list", label])
            .output()
            .await;

        let (pid, status) = match output {
            Ok(out) if out.status.success() => {
                let stdout = String::from_utf8_lossy(&out.stdout);
                // Parse PID from launchctl list output
                let pid = stdout
                    .lines()
                    .find(|l| l.contains("PID"))
                    .and_then(|l| l.split_whitespace().last())
                    .and_then(|s| s.parse::<u32>().ok());
                (pid, if pid.is_some() { "running" } else { "stopped" })
            }
            _ => (None, "stopped"),
        };

        results.push(DaemonStatus {
            name: name.to_string(),
            label: label.to_string(),
            pid,
            status: status.to_string(),
        });
    }

    Ok(results)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuditEntry {
    pub id: String,
    pub timestamp: String,
    pub action: String,
    pub source: Option<String>,
    pub destination: Option<String>,
    #[serde(default)]
    pub metadata: serde_json::Value,
    #[serde(default)]
    pub reversible: bool,
    #[serde(default)]
    pub reversed: bool,
}

#[derive(Debug, Serialize)]
pub struct AuditLogPage {
    pub entries: Vec<AuditEntry>,
    pub total_bytes: u64,
    pub offset: u64,
}

#[tauri::command]
pub async fn tail_audit_log(
    path: String,
    lines: usize,
    offset: Option<u64>,
) -> Result<AuditLogPage, AppError> {
    use tokio::io::{AsyncReadExt, AsyncSeekExt};

    let file_path = expand_home(&path);
    if !file_path.exists() {
        return Err(AppError::NotFound(format!(
            "Audit log not found at {}",
            file_path.display()
        )));
    }

    let metadata = tokio::fs::metadata(&file_path).await?;
    let total_bytes = metadata.len();

    // For small files (< 1MB), read the whole thing
    if total_bytes < 1_048_576 {
        let content = tokio::fs::read_to_string(&file_path).await?;
        let all_lines: Vec<&str> = content.lines().collect();
        let start = all_lines.len().saturating_sub(lines);
        let entries: Vec<AuditEntry> = all_lines[start..]
            .iter()
            .filter(|l| !l.trim().is_empty())
            .filter_map(|line| serde_json::from_str(line).ok())
            .collect();
        return Ok(AuditLogPage {
            entries,
            total_bytes,
            offset: offset.unwrap_or(0),
        });
    }

    // For large files, seek from the end and read only a tail chunk.
    // Each JSONL line is typically < 1KB, so read lines * 2KB as a buffer.
    let chunk_size = (lines as u64) * 2048;
    let seek_pos = total_bytes.saturating_sub(chunk_size);

    let mut file = tokio::fs::File::open(&file_path).await?;
    file.seek(std::io::SeekFrom::Start(seek_pos)).await?;

    let mut buf = Vec::with_capacity(chunk_size as usize);
    file.read_to_end(&mut buf).await?;

    let content = String::from_utf8_lossy(&buf);

    // Skip the first partial line (unless we read from the start)
    let text = if seek_pos > 0 {
        content.splitn(2, '\n').nth(1).unwrap_or("")
    } else {
        &content
    };

    let all_lines: Vec<&str> = text.lines().collect();
    let start = all_lines.len().saturating_sub(lines);

    let entries: Vec<AuditEntry> = all_lines[start..]
        .iter()
        .filter(|l| !l.trim().is_empty())
        .filter_map(|line| serde_json::from_str(line).ok())
        .collect();

    Ok(AuditLogPage {
        entries,
        total_bytes,
        offset: offset.unwrap_or(seek_pos),
    })
}

