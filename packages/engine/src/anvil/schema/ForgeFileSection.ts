import { defineBuffer } from '../../base/types/defineBuffer.js';
import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { TypeFactory } from '../../base/types/TypeRegistry.js';

export type PersistedType = {
  DataHeader: {
    IndexCount: number,
    Unknown1: number,
    OffsetToIndexTable: bigint,
    OffsetToNextDataSection: bigint,
    IndexStart: number,
    IndexEnd: number,
    OffsetToNameTable: bigint,
    Unknown2: bigint,
  },
  IndexTable: {
    OffsetToRawDataTable: bigint,
    FileDataID: bigint,
    RawDataSize: number,
  }[],
  NameTable: {
    RawDataSize: number,
    FileDataID: bigint,
    Unknown1: number,
    ResourceIdentifier: number,
    Unknown2: Buffer,
    NextFileCount: number,
    PreviousFileCount: number,
    Unknown3: number,
    Timestamp: number,
    Name: string,
    Unknown4: Buffer,
  }[]
};

// https://github.com/theawesomecoder61/Blacksmith/blob/master/Blacksmith/FileTypes/Forge.cs
export const ForgeFileSection: TypeFactory<PersistedType> = (config, resolve) => {

  const DataHeader: TypeHandler<PersistedType['DataHeader']> = defineStruct([
    { name: 'IndexCount', type: 'int32' },
    { name: 'Unknown1', type: 'int32' },
    { name: 'OffsetToIndexTable', type: 'int64' },
    { name: 'OffsetToNextDataSection', type: 'int64' },
    { name: 'IndexStart', type: 'int32' },
    { name: 'IndexEnd', type: 'int32' },
    { name: 'OffsetToNameTable', type: 'int64' },
    { name: 'Unknown2', type: 'int64' },
  ], resolve);

  const IndexEntry: TypeHandler<PersistedType['IndexTable'][number]> = defineStruct([
    { name: 'OffsetToRawDataTable', type: 'int64' },
    { name: 'FileDataID', type: 'int64' },
    { name: 'RawDataSize', type: 'int32' },
  ], resolve);

  const NameEntry: TypeHandler<PersistedType['NameTable'][number]> = defineStruct([
    { name: 'RawDataSize', type: 'int32' },
    { name: 'FileDataID', type: 'int64' },
    { name: 'Unknown1', type: 'int32' },
    { name: 'ResourceIdentifier', type: 'uint32' },
    { name: 'Unknown2', type: defineBuffer(8) },
    { name: 'NextFileCount', type: 'int32' },
    { name: 'PreviousFileCount', type: 'int32' },
    { name: 'Unknown3', type: 'int32' },
    { name: 'Timestamp', type: 'int32' },
    { name: 'Name', type: defineBuffer(128, 'utf-8') },
    { name: 'Unknown4', type: defineBuffer(20) },
  ], resolve);

  return {
    read: source => {
      const dataHeader = DataHeader.read(source);

      const indexTable: PersistedType["IndexTable"] = [];

      source.seek(Number(dataHeader.OffsetToIndexTable));
      for (let i = 0; i < dataHeader.IndexCount; i++) {
        indexTable.push(IndexEntry.read(source));
      }

      const nameTable: PersistedType["NameTable"] = [];

      if (dataHeader.OffsetToNameTable !== -1n) {
        source.seek(Number(dataHeader.OffsetToNameTable));
        for (let i = 0; i < dataHeader.IndexCount; i++) {
          nameTable.push(NameEntry.read(source));
        }
      }

      return {
        DataHeader: dataHeader,
        IndexTable: indexTable,
        NameTable: nameTable
      };
    },
    write: value => {
      throw new Error("Unsupported operation");
    }
  };
};
