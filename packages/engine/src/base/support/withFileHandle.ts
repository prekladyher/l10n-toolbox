import { FileHandle, open } from 'fs/promises';

/**
 * Execute task with file handle for the specified filename.
 */
export async function withFileHandle<T>(filename: string, flags: string, task: (handle: FileHandle) => Promise<T>) {
  const handle = await open(filename, flags);
  try {
    return await task(handle);
  } finally {
    await handle.close();
  }
}
