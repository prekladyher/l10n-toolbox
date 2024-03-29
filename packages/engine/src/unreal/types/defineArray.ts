import { TypeHandler } from '../../base/index.js';

/**
 * Create handler for array type with the specified item type.
 */
export function defineArray<T>(itemType: TypeHandler<T>): TypeHandler<T[]> {
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
      if (!Array.isArray(values)) throw Error(`Invalid value type: ${typeof values}`);
      const length = Buffer.alloc(4);
      length.writeUInt32LE(values.length);
      const buffers = [length];
      for (let i = 0; i < values.length; i++) {
        try {
          buffers.push(...itemType.write(values[i]));
        } catch (error) {
          throw new Error(`Error writing array entry ${i}`, { cause: error });
        }
      }
      return buffers;
    }
  };
}
