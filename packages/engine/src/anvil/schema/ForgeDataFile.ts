import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { TypeFactory } from '../../base/types/TypeRegistry.js';

export type PersistedType = {
  EntryHeader: {
    Unknown1: number,
    FileDataID: bigint,
    RawDataSize: number,
    Unknown2: number
  },
  EntryData: Buffer
};

export type ForgeDataFile = {
  FileDataID: bigint,
  EntryData: Buffer
};

export const ForgeDataFile: TypeFactory<ForgeDataFile> = (config, resolve) => {

  const EntryHeader: TypeHandler<PersistedType['EntryHeader']> = defineStruct([
    { name: 'Unknown1', type: 'int16' }, // 0x0100 - maybe file type
    { name: 'FileDataID', type: 'int64' },
    { name: 'RawDataSize', type: 'int32' },
    { name: 'Unknown2', type: 'int16' },
  ], resolve);

  return {
    read: source => {
      const entryHeader = EntryHeader.read(source);
      const entryData = source.read(entryHeader.RawDataSize);

      return {
        FileDataID: entryHeader.FileDataID,
        EntryData: entryData
      };
    },
    write: value => {
      const casted = value as ForgeDataFile;
      const entryHeader: PersistedType['EntryHeader'] = {
        Unknown1: 1,
        FileDataID: casted.FileDataID,
        RawDataSize: casted.EntryData.length,
        Unknown2: 0
      };

      return [
        ...EntryHeader.write(entryHeader),
        casted.EntryData
      ];
    }
  };
};
