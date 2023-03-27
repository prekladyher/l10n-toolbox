import { TypeHandler } from '../index.js';

/**
 * Create handler for zero terminated ASCII string type.
 */
export function defineAscii(): TypeHandler<string> {
  return {
    read: source => {
      let result = [];
      for (let char = source.read(1)[0]; char != 0; char = source.read(1)[0]) {
        result.push(String.fromCharCode(char));
      }
      return result.join('');
    },
    write: value => {
      if (typeof value !== 'string') throw Error(`Invalid value type: ${typeof value}`);
      return [Buffer.from(value, 'ascii'), Buffer.alloc(1)];
    }
  };
}
