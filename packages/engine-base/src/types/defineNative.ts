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
interface NativeWriteFn {

  (buffer: Buffer, value: unknown): void

}

/**
 * Create type handler for a type directly supported by NodeJS's Buffer.
 */
export function defineNative<T>(size: number, read: NativeReadFn<T>, write: NativeWriteFn): TypeHandler<T> {
  return {
    read: source => {
      return read(source.read(size));
    },
    write: value => {
      const buffer = Buffer.alloc(size);
      write(buffer, value);
      return [buffer];
    }
  };
}
