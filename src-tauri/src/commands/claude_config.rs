use crate::error::AppError;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentCatalog {
    pub version: String,
    pub agents: Vec<AgentEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentEntry {
    pub name: String,
    pub file: String,
    pub source: String,
    pub department: String,
    pub description: String,
    pub model_tier: String,
    pub capabilities: Vec<String>,
    #[serde(default)]
    pub tools: Option<Vec<String>>,
    #[serde(default)]
    pub teams: Option<Vec<String>>,
}

#[tauri::command]
pub async fn list_agents(config_dir: String) -> Result<AgentCatalog, AppError> {
    let path = expand_home(&config_dir).join("agents/catalog.json");
    if !path.exists() {
        return Err(AppError::NotFound(format!(
            "catalog.json not found at {}",
            path.display()
        )));
    }
    let content = tokio::fs::read_to_string(&path).await?;
    let catalog: serde_json::Value = serde_json::from_str(&content)?;

    let agents: Vec<AgentEntry> = serde_json::from_value(
        catalog
            .get("agents")
            .cloned()
            .unwrap_or(serde_json::Value::Array(vec![])),
    )?;

    Ok(AgentCatalog {
        version: catalog
            .get("version")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string(),
        agents,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeSettings {
    #[serde(default)]
    pub env: serde_json::Value,
    #[serde(default)]
    pub permissions: serde_json::Value,
    #[serde(default)]
    pub hooks: serde_json::Value,
}

#[tauri::command]
pub async fn read_settings(config_dir: String) -> Result<ClaudeSettings, AppError> {
    let path = expand_home(&config_dir).join("config/settings.json");
    if !path.exists() {
        return Err(AppError::NotFound(format!(
            "settings.json not found at {}",
            path.display()
        )));
    }
    let content = tokio::fs::read_to_string(&path).await?;
    Ok(serde_json::from_str(&content)?)
}

#[derive(Debug, Serialize)]
pub struct CommandEntry {
    pub name: String,
    pub description: String,
    pub file_path: String,
}

#[tauri::command]
pub async fn list_commands(config_dir: String) -> Result<Vec<CommandEntry>, AppError> {
    let commands_dir = expand_home(&config_dir).join("commands");
    if !commands_dir.exists() {
        return Err(AppError::NotFound("commands/ directory not found".into()));
    }

    let mut entries = Vec::new();
    let mut dir = tokio::fs::read_dir(&commands_dir).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();
        if path.extension().map(|e| e == "md").unwrap_or(false) {
            if let Ok(content) = tokio::fs::read_to_string(&path).await {
                let (name, description) = parse_frontmatter(&content);
                entries.push(CommandEntry {
                    name,
                    description,
                    file_path: path.display().to_string(),
                });
            }
        }
    }

    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

fn parse_frontmatter(content: &str) -> (String, String) {
    let mut name = String::new();
    let mut description = String::new();
    let mut in_frontmatter = false;

    for line in content.lines() {
        if line.trim() == "---" {
            if in_frontmatter {
                break;
            }
            in_frontmatter = true;
            continue;
        }
        if in_frontmatter {
            if let Some(val) = line.strip_prefix("name:") {
                name = val.trim().trim_matches('"').to_string();
            } else if let Some(val) = line.strip_prefix("description:") {
                description = val.trim().trim_matches('"').to_string();
            }
        }
    }

    (name, description)
}

fn expand_home(path: &str) -> PathBuf {
    if path.starts_with('~') {
        if let Some(home) = dirs::home_dir() {
            return home.join(path.strip_prefix("~/").unwrap_or(&path[1..]));
        }
    }
    PathBuf::from(path)
}
