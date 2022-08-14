import { FileSink } from '../source/index.js';

/**
 * Execute task with data sink for the specified filename.
 */
export function withFileSink(filename: string, task: (sink: FileSink) => void) {
  const sink = new FileSink(filename);
  try {
    task(sink);
  } finally {
    sink.close();
  }
}
