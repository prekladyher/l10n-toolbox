import * as fs from 'node:fs';
import DataSource from './DataSource.js';

/**
 * Node.js based file data source using single internal read buffer.
 *
 * When specifying internal buffer size (i.e. not relying on the default value), keep in mind that
 * every read request that can't fit inside that buffer will result in a new buffer allocation.
 */
export default class FileSource implements DataSource {

  /**
   * File descriptor.
   */
  private fileDesc: number;

  /**
   * Current read position.
   */
  private filePosition = 0;

  /**
   * Source data buffer.
   */
  private sourceBuffer: Buffer;

  /**
   * Cursor position inside source buffer.
   */
  private bufferOffset = 0;

  /**
   * Actual data length inside source buffer.
   */
  private bufferLength = 0;

  /**
   * @param path Source file path.
   * @param bufferSize Size of the internal source buffer.
   */
  constructor(path: string, bufferSize = 0x3fff) {
    this.fileDesc = fs.openSync(path, 'r');
    this.sourceBuffer = Buffer.alloc(bufferSize || 0x3fff);
  }

  /**
   * Read another portion of the file into the target buffer.
   */
  private readFile(buffer: Buffer): Buffer {
    const reminderLength = this.bufferLength - this.bufferOffset;
    // Copy buffer reminder to the beginning of the target buffer
    this.sourceBuffer.copy(buffer, 0, this.bufferOffset, this.bufferLength);
    // Reset read length and position
    this.bufferLength = 0;
    this.bufferOffset = 0;
    // Try to read the rest of the buffer
    const bytesRead = fs.readSync(this.fileDesc, buffer, reminderLength, buffer.length - reminderLength, this.filePosition);
    this.filePosition += bytesRead;
    return buffer.subarray(0, reminderLength + bytesRead);
  }

  /**
   * Read data using the internal source buffer.
   */
  private readBuffer(length: number): Buffer {
    if (this.bufferOffset + length > this.bufferLength) {
      this.bufferLength = this.readFile(this.sourceBuffer).length;
    }
    if (this.bufferOffset + length > this.bufferLength) {
      length = this.bufferLength;
    }
    this.bufferOffset += length;
    return this.sourceBuffer.subarray(this.bufferOffset - length, this.bufferOffset);
  }

  read(length: number): Buffer {
    if (length > this.sourceBuffer.length) {
      return this.readFile(Buffer.alloc(length));
    } else {
      return this.readBuffer(length);
    }
  }

  skip(length: number): void {
    this.bufferOffset += length;
    if (this.bufferOffset > this.bufferLength) {
      this.filePosition += this.bufferOffset - this.bufferLength;
      this.bufferOffset = 0;
      this.bufferLength = 0;
    }
  }

  close(): void {
    fs.closeSync(this.fileDesc);
  }

  cursor(): number {
    return this.filePosition - this.bufferLength + this.bufferOffset;
  }

}
