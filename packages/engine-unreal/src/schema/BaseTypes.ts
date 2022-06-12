import { defineNative, TypeHandler, TypeRegistry } from '@prekladyher/engine-base';
import { defineArray, defineGuid, defineString } from '../types';

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

export default function registerTypes(): TypeRegistry {
  return {
    bool: (legacy) => defineNative(legacy ? 4 : 1,
      legacy
        ? buffer => buffer.readUInt32LE()
        : buffer => buffer.readUInt8(),
      legacy
        ? (buffer, value) => buffer.writeUInt32LE(value as number)
        : (buffer, value) => buffer.writeUInt8(value as number)),
    int: () => defineNative(4,
      buffer => buffer.readInt32LE(),
      (buffer, value) => buffer.writeInt32LE(value as number)),
    uint8: () => defineNative(1,
      buffer => buffer.readUInt8(),
      (buffer, value) => buffer.writeUInt8(value as number)),
    uint32: () => defineNative(4,
      buffer => buffer.readUInt32LE(),
      (buffer, value) => buffer.writeUInt32LE(value as number)),
    uint64: () => defineNative(8,
      buffer => {
        const value = buffer.readBigUInt64LE();
        return value <= MAX_SAFE_INTEGER ? Number(value) : value;
      },
      (buffer, value) => buffer.writeBigUInt64LE(typeof value === 'bigint' ? value : BigInt(value as number))),
    int64: () => defineNative(8,
      buffer => {
        const value = buffer.readBigInt64LE();
        return value <= MAX_SAFE_INTEGER ? Number(value) : value;
      },
      (buffer, value) => buffer.writeBigInt64LE(typeof value === 'bigint' ? value : BigInt(value as number))),
    float: () => defineNative(4,
      buffer => buffer.readFloatLE(),
      (buffer, value) => buffer.writeFloatLE(value as number)),
    array: (config) => defineArray(config as TypeHandler<unknown>) as TypeHandler<unknown>,
    string: () => defineString(),
    guid: () => defineGuid(),
  };
}
