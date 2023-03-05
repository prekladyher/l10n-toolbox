import { DataSource } from '../index.js';
import { TypeHandler } from './TypeHandler.js';

/**
 * Buffer size provider.
 */
interface SizeProvider {

  (source: DataSource): number

}

/**
 * Create handler for a raw buffer type.
 */
export function defineBuffer(size: number|SizeProvider): TypeHandler<Buffer>;
export function defineBuffer(size: number|SizeProvider, encoding: BufferEncoding): TypeHandler<string>;
export function defineBuffer(size: number|SizeProvider, encoding?: BufferEncoding): TypeHandler<Buffer|string> {
  const resolveSize = typeof size === 'number' ? () => size : size;
  return {
    read: (source) => {
      const value = source.read(resolveSize(source));
      return encoding ? value.toString(encoding) : Buffer.from(value);
    },
    write: (value) => {
      const converted = typeof value === 'string' ? Buffer.from(value, encoding) : value;
      if (!Buffer.isBuffer(converted)) throw Error(`Invalid value type: ${typeof value}`);
      return [converted];
    }
  };
}
