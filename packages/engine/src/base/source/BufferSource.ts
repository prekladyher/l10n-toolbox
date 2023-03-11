import DataSource from './DataSource.js';

/**
 * Simple Buffer based data source.
 */
export default class BufferSource implements DataSource {

  constructor(private buffer: Buffer, private position = 0) {
  }

  read(length: number): Buffer {
    const position = this.position;
    if (position + length > this.buffer.length) {
      throw new Error('EOF');
    }
    this.position += length;
    return this.buffer.subarray(position, this.position);
  }

  skip(length: number): void {
    if (this.position + length > this.buffer.length) {
      throw new Error('EOF');
    }
    this.position += length;
  }

  seek(offset: number): void {
    if (offset < 0 || offset > this.buffer.length) {
      throw new Error('EOF');
    }
    this.position = offset;
  }

  close(): void {
    // nothing to close
  }

  cursor(): number {
    return this.position;
  }

}
