import { FileSource } from '../source/index.js';

/**
 * Execute task with data source for the specified filename.
 */
export function withFileSource<T>(filename: string, task: (source: FileSource) => T) {
  const source = new FileSource(filename);
  try {
    return task(source);
  } finally {
    source.close();
  }
}
