import { FileSink } from '../source';

/**
 * Execute task with data sink for the specified filename.
 */
export function withFileSink<T>(filename: string, task: (sink: FileSink) => void) {
  const sink = new FileSink(filename);
  try {
    task(sink);
  } finally {
    sink.close();
  }
}
