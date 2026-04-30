import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface OpenJsonFileResult {
  path: string;
  contents: string;
}

export const readJsonFile = async (path: string): Promise<string> => readTextFile(path);

export const openJsonFile = async (): Promise<OpenJsonFileResult | null> => {
  const selected = await open({
    multiple: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (typeof selected !== "string") {
    return null;
  }

  const contents = await readJsonFile(selected);
  return { path: selected, contents };
};

export const openDirectory = async (): Promise<string | null> => {
  const selected = await open({
    multiple: false,
    directory: true,
  });

  return typeof selected === "string" ? selected : null;
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
