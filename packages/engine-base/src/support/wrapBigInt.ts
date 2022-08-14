import { TypeHandler } from '../types/index.js';

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

const MIN_SAFE_INTEGER = BigInt(Number.MIN_SAFE_INTEGER);

/**
 * Safely wrap BigInt handler as Number handler.
 */
// FIXME Introduce type encode/decode function to have "native" JSON-friendly serialization
export function wrapBigInt(handler: TypeHandler<bigint>): TypeHandler<number> {
  return {
    read: source => {
      const value = handler.read(source);
      if (value > MAX_SAFE_INTEGER || value < MIN_SAFE_INTEGER) {
        throw Error(`Can not safely cast bigint to number: ${value}`);
      }
      return Number(value);
    },
    write: value => {
      return handler.write(BigInt(value as number));
    }
  };
}
