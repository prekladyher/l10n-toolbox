import { FileSource } from '../source/index.js';

/**
 * Execute task with data source for the specified filename.
 */
export async function withFileSource<T>(filename: string, task: (source: FileSource) => Promise<T>) {
  const source = new FileSource(filename);
  try {
    return await task(source);
  } finally {
    source.close();
  }
}
