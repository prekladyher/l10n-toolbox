import { TypeHandler } from '@prekladyher/engine-base';

/**
 * Create handler for string type.
 */
export function defineString(): TypeHandler<string> {
  return {
    read: source => {
      const length = source.read(4).readInt32LE();
      const buffer = source.read(length < 0 ? 2 * Math.abs(length) : length);
      return buffer.toString(length < 0 ? 'utf16le' : 'ascii').slice(0, -1);
    },
    write: value => {
      if (typeof value !== 'string') throw Error(`Invalid value type: ${typeof value}`);
      if (!value.length) {
        return [Buffer.alloc(4)];
      }
      // eslint-disable-next-line no-control-regex
      const ansi = /^[\u0000-\u007F]*$/.test(value);
      const buffer = Buffer.alloc(4 + (value.length + 1) * (ansi ? 1 : 2));
      buffer.writeInt32LE((value.length + 1) * (ansi ? 1 : -1));
      buffer.write(value, 4, ansi ? 'ascii' : 'utf16le');
      return [buffer];
    }
  };
}
