import DataSink from './DataSink.js';

/**
 * Buffer based data sink.
 */
export default class BufferSink implements DataSink {

  public buffers: Buffer[] = [];

  write(buffer: Buffer): void {
    this.buffers.push(Buffer.from(buffer));
  }

  close(): void {
    if (this.buffers.length > 1) {
      this.buffers = [Buffer.concat(this.buffers)];
    }
  }

  size(): number {
    let length = 0;
    for (const buffer of this.buffers) {
      length += buffer.length;
    }
    return length;
  }

}
