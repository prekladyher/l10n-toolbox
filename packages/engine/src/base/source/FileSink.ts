import { closeSync, openSync, writeSync } from 'node:fs';
import DataSink from './DataSink.js';

export default class FileSink implements DataSink {

  /**
   * Target file descriptor.
   */
  private fileDesc: number;

  /**
   * Number of written bytes.
   */
  private fileSize: number;

  /**
   * @param path Target file path.
   */
  constructor(path: string) {
    this.fileDesc = openSync(path, 'w');
    this.fileSize = 0;
  }

  write(buffer: Buffer): void {
    this.fileSize += buffer.length;
    writeSync(this.fileDesc, buffer);
  }

  close(): void {
    closeSync(this.fileDesc);
  }

  size(): number {
    return this.fileSize;
  }

}
