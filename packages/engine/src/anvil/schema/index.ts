import { TypeRegistry } from '../../base/index.js';
import { default as BaseTypes } from './BaseTypes.js';
import { default as ForgeData, type PersistedType as ForgeDataType } from './ForgeData.js';
import { default as ForgeFile, type PersistedType as ForgeFileType } from './ForgeFile.js';

export namespace AnvilTypes {
  export type ForgeData = ForgeDataType;
  export type ForgeFile = ForgeFileType;
};

export function registerTypes(): TypeRegistry {
  return {
    ...BaseTypes(),
    ...ForgeData(),
    ...ForgeFile(),
  };
}
