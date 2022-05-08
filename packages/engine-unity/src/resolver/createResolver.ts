import { defineStruct, defineObject, Schema, TypeResolver, TypeHandler, defineNative } from '@prekladyher/engine-base';
import { defineArray, defineString } from '../types';

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Resolve basic type key.
 */
function resolveBasic(key: string): TypeHandler<any> {
  switch (key) {
    case 'int': return defineNative(4,
      buffer => buffer.readInt32LE(),
      (buffer, value) => buffer.writeInt32LE(value));
    case 'uint8': return defineNative(4,
      buffer => buffer.readUInt8(),
      (buffer, value) => buffer.writeUInt8(value));
    case 'uint32': return defineNative(4,
      buffer => buffer.readUInt32LE(),
      (buffer, value) => buffer.writeUInt32LE(value));
    case 'uint64': return defineNative(8,
      buffer => {
        const value = buffer.readBigUInt64LE();
        return value <= MAX_SAFE_INTEGER ? Number(value) : '0x' + value.toString(16);
      },
      (buffer, value) => buffer.writeBigUInt64LE(BigInt(value)));
    case 'float': return defineNative(4,
      buffer => buffer.readFloatLE(),
      (buffer, value) => buffer.writeFloatLE(value));
    case 'string': return defineString();
    default:
      throw new Error(`Unable to resolve type: ${key}`);
  }
}

/**
 * Create type resolver based on the given schema (type dictionary).
 */
 export function createResolver(schema: Schema): TypeResolver  {
  const resolve: TypeResolver = (key: string) => {
    if (key.endsWith('[]')) {
      return defineArray(key.substring(0, key.length - 2), resolve);
    }
    const entry = schema[key];
    if (entry) {
      return Array.isArray(entry) ? defineStruct(entry, resolve) : defineObject(entry, resolve);
    }
    return resolveBasic(key);
  };
  return resolve;
}
