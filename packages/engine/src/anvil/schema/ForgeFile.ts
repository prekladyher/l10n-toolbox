import { checkStrict } from '../../base/support/checkStrict.js';
import { defineBuffer } from '../../base/types/defineBuffer.js';
import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { TypeFactory, TypeRegistry } from '../../base/types/TypeRegistry.js';
import { ForgeFileSection, PersistedType as ForgeFileSectionType } from './ForgeFileSection.js';

export type PersistedType = {
  FileHeader: {
    Magic: string,
    Unknown1: number,
    FileVersionIdentifier: number,
    OffsetToMainHeader: bigint,
  },
  MainHeader: {
    NumberOfEntries: number,
    Unknown1: Buffer,
    Unknown2: number,
    MaxFilesForThisIndex: number,
    Unknown3: number,
    OffsetToData: bigint,
  },
  DataSections: ForgeFileSectionType[]
};

// https://github.com/theawesomecoder61/Blacksmith/blob/master/Blacksmith/FileTypes/Forge.cs
const ForgeFile: TypeFactory<PersistedType> = (config, resolve) => {

  const FileHeader: TypeHandler<PersistedType['FileHeader']> = defineStruct([
    { name: 'Magic', type: defineBuffer(8, 'ascii'), assert: checkStrict('scimitar') },
    { name: 'Unknown1', type: 'uint8', value: 0 },
    { name: 'FileVersionIdentifier', type: 'int32' },
    { name: 'OffsetToMainHeader', type: 'uint64' }
  ], resolve);

  const MainHeader: TypeHandler<PersistedType['MainHeader']> = defineStruct([
    { name: 'NumberOfEntries', type: 'int32' },
    { name: 'Unknown1', type: defineBuffer(16) },
    { name: 'Unknown2', type: 'int64' },
    { name: 'MaxFilesForThisIndex', type: 'int32' },
    { name: 'Unknown3', type: 'int32' },
    { name: 'OffsetToData', type: 'int64' },
  ], resolve);

  const FileSection = ForgeFileSection(null, resolve);

  return {
    read: source => {
      const fileHeader = FileHeader.read(source);

      source.seek(Number(fileHeader.OffsetToMainHeader));
      const mainHeader = MainHeader.read(source);

      const dataSections: ForgeFileSectionType[] = [];
      for (
        let offset = Number(mainHeader.OffsetToData);
        offset > 0;
        offset = Number(dataSections[dataSections.length - 1].DataHeader.OffsetToNextDataSection)
      ) {
        source.seek(offset);
        dataSections.push(FileSection.read(source));
      }

      return {
        FileHeader: fileHeader,
        MainHeader: mainHeader,
        DataSections: dataSections
      };
    },
    write: value => {
      throw new Error("Unsupported operation");
    }
  };
};

export default function registerTypes(): TypeRegistry {
  return {
    ForgeFile
  };
}
