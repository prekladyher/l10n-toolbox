import { FileSink } from '../source/index.js';

/**
 * Execute task with data sink for the specified filename.
 */
export async function withFileSink(filename: string, task: (sink: FileSink) => Promise<void>) {
  const sink = new FileSink(filename);
  try {
    await task(sink);
  } finally {
    sink.close();
  }
}
