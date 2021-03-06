import { defineNative, TypeHandler, TypeRegistry, wrapBigInt } from '@prekladyher/engine-base';
import { defineArray, defineGuid, defineString } from '../types';

export default function registerTypes(): TypeRegistry {
  return {
    bool: (legacy) => legacy ? defineNative('UInt32LE') : defineNative('UInt8'),
    int32: () => defineNative('Int32LE'),
    uint8: () => defineNative('UInt8'),
    uint32: () => defineNative('UInt32LE'),
    uint64: () => wrapBigInt(defineNative('UInt64LE')),
    int64: () => wrapBigInt(defineNative('Int64LE')),
    float: () => defineNative('FloatLE'),
    array: (config) => defineArray(config as TypeHandler<unknown>) as TypeHandler<unknown>,
    string: () => defineString(),
    guid: () => defineGuid(),
  };
}
