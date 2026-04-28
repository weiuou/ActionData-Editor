import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface OpenJsonFileResult {
  path: string;
  contents: string;
}

export const openJsonFile = async (): Promise<OpenJsonFileResult | null> => {
  const selected = await open({
    multiple: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (typeof selected !== "string") {
    return null;
  }

  const contents = await readTextFile(selected);
  return { path: selected, contents };
};

export const saveJsonFile = async (path: string, contents: string): Promise<void> => {
  await writeTextFile(path, contents);
};

export const saveJsonFileAs = async (contents: string): Promise<string | null> => {
  const selected = await save({
    filters: [{ name: "JSON", extensions: ["json"] }],
    defaultPath: "ActionData.json",
  });

  if (!selected) {
    return null;
  }

  await writeTextFile(selected, contents);
  return selected;
};
