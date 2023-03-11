import { checkStrict } from '../../base/support/checkStrict.js';
import { defineBuffer } from '../../base/types/defineBuffer.js';
import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { TypeFactory, TypeRegistry } from '../../base/types/TypeRegistry.js';

export type PersistedType = {
  Magic: Buffer,
  Unknown1: number,
  DataTable: {
    UncompressedSize: number,
    CompressedSize: number
  }[],
  DataChunks: {
    Checksum: number,
    Data: Buffer
  }[]
};

// https://github.com/theawesomecoder61/Blacksmith/blob/master/Blacksmith/Games/Odyssey.cs
const ForgeData: TypeFactory<any> = (config, resolve) => {

  const DATA_MAGIC = Buffer.from('33AAFB5799FA0410', 'hex');

  const DataHeader: TypeHandler<Pick<PersistedType, 'Magic' | 'Unknown1'>> = defineStruct([
    { name: 'Magic', type: defineBuffer(8, 'hex'), assert: checkStrict(DATA_MAGIC.toString('hex')) },
    { name: 'Version', type: 'int16' },
    { name: 'Compression', type: 'uint8' },
    { name: 'Unknown1', type: 'uint32' },
  ], resolve);

  const DataEntry: TypeHandler<PersistedType['DataTable'][number]> = defineStruct([
    { name: 'UncompressedSize', type: 'uint32' },
    { name: 'CompressedSize', type: 'uint32' }
  ], resolve);

  const CountType: TypeHandler<number> = resolve('int32');

  return {
    read: source => {
      const dataHeader = DataHeader.read(source);
      const blockCount = CountType.read(source);
      const dataTable: PersistedType['DataTable'][number][] = [];
      for (let i = 0; i < blockCount; i++) {
        dataTable.push(DataEntry.read(source));
      }
      const dataChunks: PersistedType['DataChunks'][number][] = [];
      for (let i = 0; i < blockCount; i++) {
        dataChunks.push({
          Checksum: CountType.read(source),
          Data: source.read(dataTable[i].CompressedSize)
        });
      }
      return {
        DataHeader: dataHeader,
        DataTable: dataTable,
        DataChunks: dataChunks
      }
    },
    write: value => {
      return [];
    }
  };
};

export default function registerTypes(): TypeRegistry {
  return {
    ForgeData
  };
}
