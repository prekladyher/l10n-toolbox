import { TypeHandler } from '@prekladyher/engine-base';

/**
 * Create handler for GUID type.
 * https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Source/Runtime/Core/Private/Misc/Guid.cpp#L483
 */
export function defineGuid(): TypeHandler<string> {
  return {
    read: source => {
      return source.read(16).toString('hex').toUpperCase();
    },
    write: value => {
      if (typeof value !== 'string') throw Error(`Invalid value type: ${typeof value}`);
      const buffer = Buffer.alloc(16);
      buffer.write(value, 'hex');
      return [buffer];
    }
  };
}
