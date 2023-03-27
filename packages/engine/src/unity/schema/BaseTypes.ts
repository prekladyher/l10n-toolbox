import { defineNative, TypeHandler, TypeRegistry, wrapBigInt } from '../../base/index.js';
import { defineArray, defineString } from '../types/index.js';

export default function registerTypes(): TypeRegistry {
  return {
    int: () => defineNative('Int32LE'),
    uint8: () => defineNative('UInt32LE'),
    uint32: () => defineNative('UInt32LE'),
    int64: () => wrapBigInt(defineNative('Int64LE')),
    uint64: () => wrapBigInt(defineNative('UInt64LE')),
    float: () => defineNative('FloatLE'),
    array: (config, resolve) => defineArray(config as string, resolve) as TypeHandler<unknown>,
    string: () => defineString()
  };
}
