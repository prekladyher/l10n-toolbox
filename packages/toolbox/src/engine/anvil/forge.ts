import { AnvilTypes, createDataChunks } from '@prekladyher/l10n-toolbox-engine/anvil';
import noodle from '@prekladyher/node-oodle-data';

type DataPart = AnvilTypes.ForgeData['DataParts'][number];

export function decodeDataPart(data: DataPart): Buffer {
  const rawSize = data.DataTable.reduce((acc, head) => acc + head.UncompressedSize, 0);
  const rawData = Buffer.alloc(rawSize);
  let rawOffset = 0;
  for (let i = 0; i < data.DataChunks.length; i++) {
    const dataChunk = data.DataChunks[i];
    if (data.DataTable[i].CompressedSize === data.DataTable[i].UncompressedSize) {
      rawOffset += dataChunk.Data.copy(rawData, rawOffset);
    } else {
      noodle.Decompress(dataChunk.Data, rawData.subarray(rawOffset), data.DataTable[i].UncompressedSize);
      rawOffset += data.DataTable[i].UncompressedSize;
    }
  }
  return rawData;
}

const COMPRESSOR_TYPE = 9;

export function compressDataBuffer(data: Buffer) {
  const result = Buffer.alloc((data.length + 15) >> 4 << 4);
  return result.slice(0, noodle.Compress(COMPRESSOR_TYPE, data, data.length, result));
}

export function encodeDataPart(part: DataPart, data: Buffer, uncompressed = false): DataPart {
  const DataTable: DataPart['DataTable'] = [];
  const DataChunks: DataPart['DataChunks'] = [];
  createDataChunks(data).forEach((chunk) => {
    const compressed = uncompressed ? chunk : compressDataBuffer(chunk);
    DataTable.push({ UncompressedSize: chunk.length, CompressedSize: compressed.length });
    DataChunks.push({ Checksum: 0, Data: compressed });
  });
  return Object.assign(part, { DataChunks, DataTable });
}

export function * createIndexIterator(bundle: AnvilTypes.ForgeFile) {
  let assetIndex = 0;
  for (const section of bundle.DataSections) {
    let indexOffset = section.DataHeader.OffsetToIndexTable;
    for (const entry of section.IndexTable) {
      yield [entry, assetIndex, indexOffset] as [typeof entry, number, bigint];
      assetIndex++;
      indexOffset += 20n
    }
  }
}
