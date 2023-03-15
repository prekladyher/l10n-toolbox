import { TypeRegistry } from '../../base/index.js';
import { default as BaseTypes } from './BaseTypes.js';
import { type ForgeData as ForgeDataType } from './ForgeData.js';
import { ForgeDataFile, type ForgeDataFile as ForgeDataFileType } from './ForgeDataFile.js';
import { ForgeDataPart } from './ForgeDataPart.js';
import { default as ForgeFile, type PersistedType as ForgeFileType } from './ForgeFile.js';

export * as ForgeData from './ForgeData.js';

export namespace AnvilTypes {
  export type ForgeFile = ForgeFileType;
  export type ForgeData = ForgeDataType;
  export type ForgeDataFile = ForgeDataFileType;
};

export function registerTypes(): TypeRegistry {
  return {
    ...BaseTypes(),
    ...ForgeFile(),
    ForgeDataPart,
    ForgeDataFile
  };
}
