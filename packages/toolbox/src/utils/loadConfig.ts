import { readFileSync } from 'fs';

/**
 * Load JSON configuration file.
 * @param path Configuration file path.
 * @returns Loaded configuration.
 */
export function loadConfig(path: string) {
  // TODO allow loading package files
  return JSON.parse(readFileSync(path, { encoding: "utf8"}));
}
