import { checkStrict } from '../../base/support/checkStrict.js';
import { defineBuffer } from '../../base/types/defineBuffer.js';
import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { TypeFactory, TypeRegistry } from '../../base/types/TypeRegistry.js';

export type PersistedType = {
  FileHeader: {
    Magic: string,
    Unknown1: number,
    FileVersionIdentifier: number,
    OffsetToDataHeader: BigInt,
  },
  MainHeader: {
    NumberOfEntries: number,
    Unknown1: Buffer,
    Unknown2: number,
    MaxFilesForThisIndex: number,
    Unknown3: number,
    OffsetToData: BigInt,
  },
  DataHeader: {
    IndexCount: number,
    Unknown1: number,
    OffsetToIndexTable: BigInt,
    OffsetToNextDataSection: BigInt,
    IndexStart: number,
    IndexEnd: number,
    OffsetToNameTable: BigInt,
    Unknown2: BigInt,
  },
  IndexTable: {
    OffsetToRawDataTable: BigInt,
    FileDataID: BigInt,
    RawDataSize: number,
  }[],
  NameTable: {
    RawDataSize: number,
    FileDataID: BigInt,
    Unknown1: number,
    ResourceIdentifier: number,
    Unknown2: Buffer,
    NextFileCount: number,
    PreviousFileCount: number,
    Unknown3: number,
    Timestamp: number,
    Name: string,
    Unknown4: Buffer,
  }[],
  DataTable: Buffer[]
};

// https://github.com/theawesomecoder61/Blacksmith/blob/master/Blacksmith/FileTypes/Forge.cs
const ForgeFile: TypeFactory<PersistedType> = (config, resolve) => {

  const FileHeader: TypeHandler<PersistedType['FileHeader']> = defineStruct([
    { name: 'Magic', type: defineBuffer(8, 'ascii'), assert: checkStrict('scimitar') },
    { name: 'Unknown1', type: 'uint8', value: 0 },
    { name: 'FileVersionIdentifier', type: 'int32' },
    { name: 'OffsetToDataHeader', type: 'uint64' }
  ], resolve);

  const MainHeader: TypeHandler<PersistedType['MainHeader']> = defineStruct([
    { name: 'NumberOfEntries', type: 'int32' },
    { name: 'Unknown1', type: defineBuffer(16) },
    { name: 'Unknown2', type: 'int64' },
    { name: 'MaxFilesForThisIndex', type: 'int32' },
    { name: 'Unknown3', type: 'int32' },
    { name: 'OffsetToData', type: 'int64' },
  ], resolve);

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
      const fileHeader = FileHeader.read(source);

      source.seek(Number(fileHeader.OffsetToDataHeader));

      const mainHeader = MainHeader.read(source);

      source.seek(Number(mainHeader.OffsetToData));

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
        FileHeader: fileHeader,
        MainHeader: mainHeader,
        DataHeader: dataHeader,
        IndexTable: indexTable,
        NameTable: nameTable,
        DataTable: [] // lazy
      };
    },
    write: value => {
      return [];
    }
  };
};

export default function registerTypes(): TypeRegistry {
  return {
    ForgeFile
  };
}
