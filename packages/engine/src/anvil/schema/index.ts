import { TypeRegistry } from '../../base/index.js';
import { default as BaseTypes } from './BaseTypes.js';
import { default as ForgeFile } from './ForgeFile.js';

export function registerTypes(): TypeRegistry {
  return {
    ...BaseTypes(),
    ...ForgeFile(),
  };
}
