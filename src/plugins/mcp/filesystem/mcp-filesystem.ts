// Filesystem MCP Plugin
import { readFile, writeFile, readdir, stat } from "fs/promises";
import { join, resolve } from "path";

export interface FileSystemConfig {
  rootPath: string;
}

export async function readFileContent(path: string): Promise<string> {
  return readFile(path, "utf-8");
}

export async function writeFileContent(path: string, content: string): Promise<void> {
  await writeFile(path, content);
}

export async function listFiles(dirPath: string): Promise<string[]> {
  return readdir(dirPath);
}

export async function getFileInfo(path: string): Promise<{ size: number; mtime: Date }> {
  const info = await stat(path);
  return { size: info.size, mtime: info.mtime };
}
