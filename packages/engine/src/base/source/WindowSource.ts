import DataSource from './DataSource.js';

/**
 * Windowed DataSource wrapper.
 */
export default class WindowSource implements DataSource {

  constructor(private source: DataSource, private size: number) {
  }

  read(length: number): Buffer {
    this.size -= length;
    if (this.size < 0) {
      throw new Error('EOF');
    }
    return this.source.read(length);
  }

  skip(length: number): void {
    this.size -= length;
    return this.source.skip(length);
  }

  seek(offset: number): void {
    throw new Error('unsupported operation');
  }

  close(): void {
    // nothing to close
  }

  cursor(): number {
    // Report position of wrapped data source
    return this.source.cursor();
  }

}
