use crate::error::AppError;
use crate::utils::expand_home;
use serde::{Deserialize, Serialize};

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

// ---------------------------------------------------------------------------
// list_stacks
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct StackEntry {
    pub name: String,
    pub description: String,
    pub short_label: String,
    pub commands: serde_json::Value,
    pub file_path: String,
}

/// Read YAML stack definitions from `{config_dir}/config/stacks/*.yaml` and
/// return a sorted list of [`StackEntry`].
#[tauri::command]
pub async fn list_stacks(config_dir: String) -> Result<Vec<StackEntry>, AppError> {
    let stacks_dir = expand_home(&config_dir).join("config/stacks");
    if !stacks_dir.exists() {
        return Err(AppError::NotFound("config/stacks/ directory not found".into()));
    }

    let mut entries: Vec<StackEntry> = Vec::new();
    let mut dir = tokio::fs::read_dir(&stacks_dir).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();
        if path.extension().map(|e| e == "yaml" || e == "yml").unwrap_or(false) {
            let content = match tokio::fs::read_to_string(&path).await {
                Ok(c) => c,
                Err(_) => continue,
            };

            let doc: serde_yaml::Value = match serde_yaml::from_str(&content) {
                Ok(v) => v,
                Err(_) => continue,
            };

            // Use filename stem as fallback name.
            let fallback_name = path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string();

            let name = doc
                .get("name")
                .and_then(|v| v.as_str())
                .unwrap_or(&fallback_name)
                .to_string();

            let description = doc
                .get("description")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();

            let short_label = doc
                .get("short_label")
                .and_then(|v| v.as_str())
                .unwrap_or(&name)
                .to_string();

            // Convert the `commands` sub-map to a JSON value so the frontend
            // can iterate it without needing a fixed schema.
            let commands = if let Some(cmds) = doc.get("commands") {
                serde_json::to_value(cmds).unwrap_or(serde_json::Value::Object(Default::default()))
            } else {
                serde_json::Value::Object(Default::default())
            };

            entries.push(StackEntry {
                name,
                description,
                short_label,
                commands,
                file_path: path.display().to_string(),
            });
        }
    }

    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

// ---------------------------------------------------------------------------
// list_rules
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct RuleEntry {
    pub name: String,
    pub file_path: String,
    /// First 200 characters of the rule body, after stripping frontmatter.
    pub preview: String,
}

/// Read markdown rule files from `{config_dir}/rules/*.md` and return a sorted
/// list of [`RuleEntry`].
#[tauri::command]
pub async fn list_rules(config_dir: String) -> Result<Vec<RuleEntry>, AppError> {
    let rules_dir = expand_home(&config_dir).join("rules");
    if !rules_dir.exists() {
        return Err(AppError::NotFound("rules/ directory not found".into()));
    }

    let mut entries: Vec<RuleEntry> = Vec::new();
    let mut dir = tokio::fs::read_dir(&rules_dir).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();
        if path.extension().map(|e| e == "md").unwrap_or(false) {
            let content = match tokio::fs::read_to_string(&path).await {
                Ok(c) => c,
                Err(_) => continue,
            };

            let fallback_name = path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string();

            let (fm_name, body) = parse_rule_frontmatter(&content, &fallback_name);

            let preview: String = body.chars().take(200).collect();

            entries.push(RuleEntry {
                name: fm_name,
                file_path: path.display().to_string(),
                preview,
            });
        }
    }

    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

/// Parse the YAML frontmatter of a markdown file.  Returns `(name, body)` where
/// `body` is everything after the closing `---` delimiter, trimmed.  If no
/// frontmatter is present the whole `content` becomes the body and `fallback`
/// is used as the name.
fn parse_rule_frontmatter(content: &str, fallback: &str) -> (String, String) {
    let mut name = String::new();
    let mut in_frontmatter = false;
    let mut frontmatter_ended = false;
    let mut body_start_line: usize = 0;

    for (i, line) in content.lines().enumerate() {
        if line.trim() == "---" {
            if !in_frontmatter {
                in_frontmatter = true;
                continue;
            } else {
                // Closing delimiter — body starts on the next line.
                frontmatter_ended = true;
                body_start_line = i + 1;
                break;
            }
        }
        if in_frontmatter {
            if let Some(val) = line.strip_prefix("name:") {
                name = val.trim().trim_matches('"').to_string();
            }
        }
    }

    if name.is_empty() {
        name = fallback.to_string();
    }

    let body = if frontmatter_ended {
        content
            .lines()
            .skip(body_start_line)
            .collect::<Vec<_>>()
            .join("\n")
            .trim()
            .to_string()
    } else {
        content.trim().to_string()
    };

    (name, body)
}

// ---------------------------------------------------------------------------
// list_hooks
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct HookEntry {
    pub name: String,
    pub file_path: String,
    /// First comment line found after the shebang, used as a human description.
    pub description: String,
}

/// Read shell hook scripts from `{config_dir}/hooks/*.sh` and return a sorted
/// list of [`HookEntry`].
#[tauri::command]
pub async fn list_hooks(config_dir: String) -> Result<Vec<HookEntry>, AppError> {
    let hooks_dir = expand_home(&config_dir).join("hooks");
    if !hooks_dir.exists() {
        return Err(AppError::NotFound("hooks/ directory not found".into()));
    }

    let mut entries: Vec<HookEntry> = Vec::new();
    let mut dir = tokio::fs::read_dir(&hooks_dir).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();
        if path.extension().map(|e| e == "sh").unwrap_or(false) {
            let content = match tokio::fs::read_to_string(&path).await {
                Ok(c) => c,
                Err(_) => continue,
            };

            let name = path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string();

            let description = extract_hook_description(&content);

            entries.push(HookEntry {
                name,
                file_path: path.display().to_string(),
                description,
            });
        }
    }

    entries.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(entries)
}

/// Skip the shebang line (if present), then return the first line that begins
/// with `#` as a description (stripping the leading `#` and whitespace).
fn extract_hook_description(content: &str) -> String {
    let mut skip_shebang = true;

    for line in content.lines() {
        let trimmed = line.trim();
        // Skip the shebang (`#!/...`) on the very first qualifying line.
        if skip_shebang && trimmed.starts_with("#!") {
            skip_shebang = false;
            continue;
        }
        skip_shebang = false; // After the first non-shebang line, stop skipping.

        if trimmed.starts_with('#') {
            return trimmed
                .trim_start_matches('#')
                .trim()
                .to_string();
        }
    }

    String::new()
}
