import { calcPadding, TypeHandler } from '../../base/index.js';

/**
 * Create handler for UTF-8 string type.
 */
export function defineString(): TypeHandler<string> {
  return {
    read: source => {
      const length = source.read(4).readUInt32LE();
      const value = source.read(length).toString('utf8');
      source.skip(calcPadding(length));
      return value;
    },
    write: value => {
      if (typeof value !== 'string') throw Error(`Invalid value type: ${typeof value}`);
      const string = Buffer.from(value);
      const length = Buffer.alloc(4);
      length.writeUInt32LE(string.length);
      return [length, string, Buffer.alloc(calcPadding(string.length))];
    }
  };
}
