import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { parseCSharpSchemaFiles, type TimelineSchemaRegistry } from "@/schema/csharpTimelineSchema";

interface SchemaSource {
  path: string;
  contents: string;
}

const isSchemaFileName = (fileName: string) =>
  fileName === "ActionData.cs" || (fileName.endsWith("Data.cs") && !fileName.endsWith(".Designer.cs"));

const loadSchemaSourcesViaFsPlugin = async (schemaDirectoryPath: string): Promise<SchemaSource[]> => {
  const entries = await readDir(schemaDirectoryPath);
  const fileNames = entries
    .filter((entry) => entry.isFile && isSchemaFileName(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(
    fileNames.map(async (fileName) => {
      const path = await join(schemaDirectoryPath, fileName);
      return {
        path,
        contents: await readTextFile(path),
      };
    }),
  );
};

const loadSchemaSources = async (schemaDirectoryPath: string): Promise<SchemaSource[]> => {
  try {
    return await invoke<SchemaSource[]>("load_timeline_schema_sources", { schemaDirectoryPath });
  } catch {
    return loadSchemaSourcesViaFsPlugin(schemaDirectoryPath);
  }
};

export const loadTimelineSchemaRegistry = async (schemaDirectoryPath: string): Promise<TimelineSchemaRegistry | null> => {
  const sources = await loadSchemaSources(schemaDirectoryPath);
  if (sources.length === 0) {
    return null;
  }
  return parseCSharpSchemaFiles(sources);
};
