import { calcPadding, TypeHandler, TypeKey, TypeResolver } from '../../base/index.js';

/**
 * Create special case array handler for compacted UInt8 arrays.
 */
function defineUint8Array(): TypeHandler<number[]> {
  return {
    read: source => {
      const length = source.read(4).readUInt32LE();
      const values = Array.from(source.read(length));
      source.skip(calcPadding(length));
      return values;
    },
    write: values => {
      if (!Array.isArray(values)) throw new Error(`Invalid value type: ${typeof values}`);
      const length = values.length;
      const buffer = Buffer.alloc(4 + length + calcPadding(length));
      buffer.writeUInt32LE(length);
      Buffer.from(values as number[]).copy(buffer, 4);
      return [buffer];
    }
  };
}

/**
 * Create handler for array type with the specified item type.
 */
export function defineArray(itemKey: TypeKey, resolve: TypeResolver): TypeHandler<unknown[]> {
  if (itemKey === 'uint8') {
    return defineUint8Array();
  }
  const itemType = resolve(itemKey);
  return {
    read: source => {
      const length = source.read(4).readUInt32LE();
      const values = [];
      for (let i = 0; i < length; i++) {
        values.push(itemType.read(source));
      }
      return values;
    },
    write: values => {
      if (!Array.isArray(values)) throw new Error(`Invalid value type: ${typeof values}`);
      const length = Buffer.alloc(4);
      length.writeUInt32LE(values.length || 0);
      const buffers = [length];
      if (values) {
        for (let i = 0; i < values.length; i++) {
          try {
            buffers.push(...itemType.write(values[i]));
          } catch (error) {
            throw new Error(`Error writing array entry ${i}`, { cause: error });
          }
        }
      }
      return buffers;
    }
  };
}
