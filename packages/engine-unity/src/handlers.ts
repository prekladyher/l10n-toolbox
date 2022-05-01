import { calcPadding, nativeType, ObjectSchema, Schema, StructSchema, TypeHandler, TypeResolver } from '@prekladyher/engine-base';

/**
 * Create type resolver based on the given schema (type dictionary).
 * @return {TypeResolver} Type resolver for the given schema.
 */
export function createResolver(schema: Schema): TypeResolver  {
  const factory: TypeResolver = (key: string) => {
    if (key.endsWith('[]')) {
      return arrayType(factory(key.substring(0, key.length - 2)));
    }
    const def = schema[key];
    if (def) {
      return Array.isArray(def) ? structType(def, factory) : objectType(def, factory);
    }
    switch (key) {
      case 'int': return nativeType(4, 'Int32LE');
      case 'uint8': return nativeType(1, 'UInt8');
      case 'uint32': return nativeType(4, 'UInt32LE');
      case 'uint64': return nativeType(8, 'BigUInt64LE');
      case 'float': return nativeType(4, 'FloatLE');
      case 'string': return stringType();
      default:
        throw new Error(`Unable to resolve type: ${key}`);
    }
  };
  return factory;
}

/**
 * Create handler for UTF-8 string type.
 */
export function stringType(): TypeHandler<string> {
  return {
    decode: (buffer, offset) => {
      const length = buffer.readUInt32LE(offset);
      return [
        4 + length + calcPadding(length),
        buffer.toString('utf8', offset + 4, offset + 4 + length)
      ];
    },
    encode: (value) => {
      const string = Buffer.from(value);
      const length = Buffer.alloc(4);
      length.writeUInt32LE(string.length);
      return [length, string, Buffer.alloc(calcPadding(string.length))];
    }
  };
}

/**
 * Create handler for array type with the specified item type handler.
 */
export function arrayType<T>(itemType: TypeHandler<T>): TypeHandler<T[]> {
  return {
    decode: (buffer, offset) => {
      const length = buffer.readUInt32LE(offset);
      let bytes = 4;
      const result = [];
      for (let i = 0; i < length; i++) {
        const [size, value] = itemType.decode(buffer, offset + bytes);
        bytes += size;
        result.push(value);
      }
      return [bytes + calcPadding(bytes), result];
    },
    encode: (value) => {
      const length = Buffer.alloc(4);
      length.writeUInt32LE(value.length);
      const buffers = [length];
      for (const item of value) {
        buffers.push(...itemType.encode(item));
      }
      buffers.push(Buffer.alloc(calcPadding(value.length)));
      return buffers;
    }
  };
}

/**
 * Create handler for struct type.
 */
export function structType(schema: StructSchema, resolve: TypeResolver): TypeHandler<Record<string, unknown>> {
  return {
    decode: (buffer, offset) => {
      let bytes = 0;
      const result = {} as Record<string, unknown>;
      for (const member of schema) {
        const [size, value] = resolve(member.type).decode(buffer, offset + bytes);
        if (member.assert && !member.assert(value, member)) {
          throw Error(`Unexpected ${member.name} value: ${value} at offset: ${offset + bytes}`);
        }
        bytes += size + calcPadding(size);
        if (member.name) {
          result[member.name] = value;
        }
      }
      return [bytes, result];
    },
    encode: (struct: Record<string, unknown>) => {
      return schema.flatMap(member => {
        const value = member.name in struct ? struct[member.name] : member.value;
        const buffers = resolve(member.type).encode(value);
        const length = buffers.reduce((acc, buf) => acc + buf.length, 0);
        return length % 4 ? [Buffer.concat(buffers, calcPadding(length))] : buffers;
      });
    }
  };
}

/**
 * Create handler for complex object.
 */
export function objectType(schema: ObjectSchema, resolve: TypeResolver): TypeHandler<unknown> {
  const layout = structType(schema.layout, resolve);
  return {
    decode: (buffer, offset) => {
      const [bytes, value] = layout.decode(buffer, offset);
      return [bytes, schema.restore(value)];
    },
    encode: (value) => {
      return layout.encode(schema.persist(value) as Record<string, unknown>);
    }
  };
}
