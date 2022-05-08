import { calcPadding, TypeHandler } from '@prekladyher/engine-base';

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
      const string = Buffer.from(value);
      const length = Buffer.alloc(4);
      length.writeUInt32LE(string.length);
      return [length, string, Buffer.alloc(calcPadding(string.length))];
    }
  };
}
