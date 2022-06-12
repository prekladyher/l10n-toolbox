import { TypeHandler } from './TypeHandler';

/**
 * Function responsible for calling Buffer's read method.
 */
interface NativeReadFn<T> {

  (buffer: Buffer): T

}

/**
 * Function responsible for calling Buffer's write method.
 */
interface NativeWriteFn<T> {

  (buffer: Buffer, value: T): void

}

export function defineNumber(size: number, read: NativeReadFn<number>, write: NativeWriteFn<number>): TypeHandler<number> {
  return {
    read: (source) => {
      return read(source.read(size));
    },
    write: (value) => {
      if (typeof value !== 'number') throw Error(`Invalid value type: ${typeof value}`);
      const buffer = Buffer.alloc(size);
      write(buffer, value);
      return [buffer];
    }
  };
}

export function defineBigInt(size: number, read: NativeReadFn<bigint>, write: NativeWriteFn<bigint>): TypeHandler<bigint> {
  return {
    read: (source) => {
      return read(source.read(size));
    },
    write: (value) => {
      if (typeof value !== 'bigint') throw Error(`Invalid value type: ${typeof value}`);
      const buffer = Buffer.alloc(size);
      write(buffer, value);
      return [buffer];
    }
  };
}

const NumberTypes = {
  Int8: defineNumber(1, b => b.readInt8(), (b, v) => b.writeInt8(v)),
  Int16LE: defineNumber(2, b => b.readInt16LE(), (b, v) => b.writeInt16LE(v)),
  Int16BE: defineNumber(2, b => b.readInt16BE(), (b, v) => b.writeInt16BE(v)),
  Int32LE: defineNumber(4, b => b.readInt32LE(), (b, v) => b.writeInt32LE(v)),
  Int32BE: defineNumber(4, b => b.readInt32BE(), (b, v) => b.writeInt32BE(v)),
  FloatLE: defineNumber(4, b => b.readFloatLE(), (b, v) => b.writeFloatLE(v)),
  FloatBE: defineNumber(4, b => b.readFloatBE(), (b, v) => b.writeFloatBE(v)),
  UInt8: defineNumber(1, b => b.readUInt8(), (b, v) => b.writeUInt8(v)),
  UInt16LE: defineNumber(2, b => b.readUInt16LE(), (b, v) => b.writeUInt16LE(v)),
  UInt16BE: defineNumber(2, b => b.readUInt16BE(), (b, v) => b.writeUInt16BE(v)),
  UInt32LE: defineNumber(4, b => b.readUInt32LE(), (b, v) => b.writeUInt32LE(v)),
  UInt32BE: defineNumber(4, b => b.readUInt32BE(), (b, v) => b.writeUInt32BE(v)),
};

type NumberType = keyof typeof NumberTypes;

const BigIntTypes = {
  Int64LE: defineBigInt(8, b => b.readBigInt64LE(), (b, v) => b.writeBigInt64LE(v)),
  Int64BE: defineBigInt(8, b => b.readBigInt64BE(), (b, v) => b.writeBigInt64BE(v)),
  UInt64LE: defineBigInt(8, b => b.readBigUInt64LE(), (b, v) => b.writeBigUInt64LE(v)),
  UInt64BE: defineBigInt(8, b => b.readBigUInt64BE(), (b, v) => b.writeBigUInt64BE(v)),
};

type BigIntType = keyof typeof BigIntTypes;

const NativeTypes = {
  ...NumberTypes,
  ...BigIntTypes
};

export type NativeType = keyof typeof NativeTypes;

// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
type NativeHandler<T extends NativeType> =
  T extends NumberType ? TypeHandler<number> :
  T extends BigIntType ? TypeHandler<bigint> :
  TypeHandler<unknown>;

/**
 * Create type handler for a type directly supported by NodeJS's Buffer.
 */
export function defineNative<T extends NativeType>(type: T): NativeHandler<T> {
  return NativeTypes[type] as NativeHandler<T>;
}
