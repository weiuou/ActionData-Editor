use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
struct SchemaSource {
    path: String,
    contents: String,
}

fn is_schema_file_name(file_name: &str) -> bool {
    file_name == "ActionData.cs" || (file_name.ends_with("Data.cs") && !file_name.ends_with(".Designer.cs"))
}

#[tauri::command]
fn load_timeline_schema_sources(schema_directory_path: String) -> Result<Vec<SchemaSource>, String> {
    let directory = Path::new(&schema_directory_path);

    let mut schema_paths = fs::read_dir(directory)
        .map_err(|error| format!("Failed to read schema directory: {error}"))?
        .filter_map(|entry| entry.ok())
        .filter_map(|entry| {
            let file_name = entry.file_name();
            let file_name = file_name.to_str()?;
            if entry.file_type().ok()?.is_file() && is_schema_file_name(file_name) {
                Some(entry.path())
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    schema_paths.sort();

    schema_paths
        .into_iter()
        .map(|path| {
            let contents = fs::read_to_string(&path)
                .map_err(|error| format!("Failed to read schema file {}: {error}", path.display()))?;

            Ok(SchemaSource {
                path: path.to_string_lossy().into_owned(),
                contents,
            })
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![load_timeline_schema_sources])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
