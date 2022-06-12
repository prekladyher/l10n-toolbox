import { defineNative, TypeHandler, TypeRegistry } from '@prekladyher/engine-base';
import { defineArray, defineString } from '../types';

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

export default function registerTypes(): TypeRegistry {
  return {
    int: () => defineNative(4,
      buffer => buffer.readInt32LE(),
      (buffer, value) => buffer.writeInt32LE(value as number)),
    uint8: () => defineNative(4,
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
    float: () => defineNative(4,
      buffer => buffer.readFloatLE(),
      (buffer, value) => buffer.writeFloatLE(value as number)),
    array: (config, resolve) => defineArray(config as string, resolve) as TypeHandler<unknown>,
    string: () => defineString()
  };
}
