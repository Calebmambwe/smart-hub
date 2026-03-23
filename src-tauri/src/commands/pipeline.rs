use crate::error::AppError;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct TasksFile {
    pub project: String,
    pub stack: String,
    pub tasks: Vec<Task>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: i32,
    pub title: String,
    pub status: String,
    pub priority: String,
    pub risk: String,
    #[serde(default)]
    pub depends_on: Vec<i32>,
    #[serde(default)]
    pub acceptance: Vec<String>,
    #[serde(default)]
    pub files: Vec<String>,
    #[serde(default)]
    pub attempts: i32,
    #[serde(default)]
    pub max_attempts: i32,
}

#[tauri::command]
pub async fn read_tasks(project_dir: String) -> Result<TasksFile, AppError> {
    let path = expand_home(&project_dir).join("tasks.json");
    if !path.exists() {
        return Err(AppError::NotFound(format!(
            "tasks.json not found at {}",
            path.display()
        )));
    }
    let content = tokio::fs::read_to_string(&path).await?;
    Ok(serde_json::from_str(&content)?)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GhostConfig {
    pub feature: String,
    pub trust: String,
    pub max_tasks: i32,
    pub project_dir: String,
    pub status: String,
    #[serde(default)]
    pub started_at: Option<String>,
    #[serde(default)]
    pub completed_at: Option<String>,
    #[serde(default)]
    pub pr_url: Option<String>,
    #[serde(default)]
    pub files_changed: Option<i32>,
    #[serde(default)]
    pub lines_added: Option<i32>,
    #[serde(default)]
    pub lines_removed: Option<i32>,
    #[serde(default)]
    pub tests_passed: Option<i32>,
    #[serde(default)]
    pub tests_failed: Option<i32>,
}

#[tauri::command]
pub async fn read_ghost_config(claude_dir: String) -> Result<GhostConfig, AppError> {
    let path = expand_home(&claude_dir).join("ghost-config.json");
    if !path.exists() {
        return Err(AppError::NotFound("ghost-config.json not found".into()));
    }
    let content = tokio::fs::read_to_string(&path).await?;
    Ok(serde_json::from_str(&content)?)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MetricsEvent {
    pub timestamp: String,
    pub job_id: String,
    pub event: String,
    pub project: String,
    pub feature: String,
    #[serde(default)]
    pub agents_used: i32,
    #[serde(default)]
    pub total_minutes: i32,
    #[serde(default)]
    pub model_cost_usd: f64,
    #[serde(default)]
    pub outcome: String,
}

#[tauri::command]
pub async fn read_metrics(metrics_path: String) -> Result<Vec<MetricsEvent>, AppError> {
    let path = expand_home(&metrics_path);
    if !path.exists() {
        return Ok(vec![]);
    }
    let content = tokio::fs::read_to_string(&path).await?;
    let events: Vec<MetricsEvent> = content
        .lines()
        .filter(|line| !line.trim().is_empty())
        .filter_map(|line| serde_json::from_str(line).ok())
        .collect();
    Ok(events)
}

/// Expand a leading `~` to the user's home directory.
fn expand_home(path: &str) -> PathBuf {
    if let Some(rest) = path.strip_prefix('~') {
        if let Some(home) = dirs::home_dir() {
            return home.join(rest.strip_prefix('/').unwrap_or(rest));
        }
    }
    PathBuf::from(path)
}

// ---------------------------------------------------------------------------
// list_open_prs
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct PullRequest {
    pub number: i32,
    pub title: String,
    pub state: String,
    pub url: String,
    pub head_branch: String,
}

/// Run `gh pr list` in `project_dir` and return up to 20 pull requests.
///
/// Shells out to the GitHub CLI so that the caller's `gh` auth context is used.
/// Returns an empty list when the directory is not a GitHub repo or when `gh`
/// is not installed.
#[tauri::command]
pub async fn list_open_prs(project_dir: String) -> Result<Vec<PullRequest>, AppError> {
    let dir = expand_home(&project_dir);

    let output = tokio::process::Command::new("gh")
        .args([
            "pr",
            "list",
            "--json",
            "number,title,state,url,headRefName",
            "--limit",
            "20",
        ])
        .current_dir(&dir)
        .output()
        .await
        .map_err(|e| AppError::Shell(format!("failed to run gh: {e}")))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(AppError::Shell(format!("gh pr list failed: {stderr}")));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    // `gh pr list --json` returns a JSON array.
    let raw: Vec<serde_json::Value> = serde_json::from_str(&stdout)?;

    let mut prs: Vec<PullRequest> = raw
        .into_iter()
        .filter_map(|v| {
            Some(PullRequest {
                number: v.get("number")?.as_i64()? as i32,
                title: v.get("title")?.as_str()?.to_string(),
                state: v.get("state")?.as_str()?.to_string(),
                url: v.get("url")?.as_str()?.to_string(),
                head_branch: v.get("headRefName")?.as_str()?.to_string(),
            })
        })
        .collect();

    prs.sort_by(|a, b| b.number.cmp(&a.number)); // newest first
    Ok(prs)
}
