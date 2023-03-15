import { checkStrict } from '../../base/support/checkStrict.js';
import { defineBuffer } from '../../base/types/defineBuffer.js';
import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { TypeFactory } from '../../base/types/TypeRegistry.js';

export type PersistedType = {
  DataHeader: {
    Magic: Buffer,
    Version: number,
    Compression: number,
    Unknown1: number
  }
  DataTable: {
    UncompressedSize: number,
    CompressedSize: number
  }[],
  DataChunks: {
    Checksum: number,
    Data: Buffer
  }[]
};

export const DATA_MAGIC = Buffer.from('33AAFB5799FA0410', 'hex');

// https://github.com/theawesomecoder61/Blacksmith/blob/master/Blacksmith/Games/Odyssey.cs
export const ForgeDataPart: TypeFactory<PersistedType> = (config, resolve) => {

  const DataHeader: TypeHandler<PersistedType['DataHeader']> = defineStruct([
    { name: 'Magic', type: defineBuffer(8, 'hex'), assert: checkStrict(DATA_MAGIC.toString('hex')) },
    { name: 'Version', type: 'int16' },
    { name: 'Compression', type: 'uint8' },
    { name: 'Unknown1', type: 'uint32' },
  ], resolve);

  const DataEntry: TypeHandler<PersistedType['DataTable'][number]> = defineStruct([
    { name: 'UncompressedSize', type: 'uint32' },
    { name: 'CompressedSize', type: 'uint32' }
  ], resolve);

  const DataEntry_Reversed: TypeHandler<PersistedType['DataTable'][number]> = defineStruct([
    { name: 'CompressedSize', type: 'uint32' },
    { name: 'UncompressedSize', type: 'uint32' }
  ], resolve);

  return {
    read: source => {
      const dataHeader = DataHeader.read(source);
      let blockCount = source.read(4).readInt32LE();
      // XXX Not sure how to recognize single byte block count situation properly
      const reversedEntry = dataHeader.Compression === 0x0A && (blockCount & 0xff) !== blockCount;
      if (reversedEntry) {
        blockCount = blockCount & 0xff;
        source.seek(source.cursor() - 3);
      }
      const dataTable: PersistedType['DataTable'][number][] = [];
      for (let i = 0; i < blockCount; i++) {
        dataTable.push(reversedEntry ? DataEntry_Reversed.read(source) : DataEntry.read(source));
      }
      const dataChunks: PersistedType['DataChunks'][number][] = [];
      for (let i = 0; i < blockCount; i++) {
        dataChunks.push({
          Checksum: source.read(4).readInt32LE(),
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
      const casted = value as PersistedType;
      // DataHeader
      const buffers = [...DataHeader.write(casted.DataHeader)];
      // BlockCount
      // TODO 0x0A block count as single byte
      const length = Buffer.alloc(4);
      length.writeInt32LE(casted.DataTable.length);
      buffers.push(length);
      // DataTable
      casted.DataTable.forEach(entry => buffers.push(...DataEntry.write(entry)));
      // DataChunks
      casted.DataChunks.forEach(entry => {
        const checksum = Buffer.alloc(4);
        checksum.writeInt32LE(entry.Checksum);
        buffers.push(checksum);
        buffers.push(entry.Data)
      });
      return buffers;
    }
  };
};
