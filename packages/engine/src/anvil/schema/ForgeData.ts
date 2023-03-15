import BufferSource from '../../base/source/BufferSource.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { type PersistedType as ForgeDataPartType } from './ForgeDataPart.js';

export type ForgeData = {
  DataParts: ForgeDataPartType[]
};

export const FORGE_DATA_MAGIC = Buffer.from('33AAFB5799FA0410', 'hex');

/**
 * Read ForgeData from the given buffer.
 */
export function readForgeData(buffer: Buffer, handler: TypeHandler<ForgeDataPartType>): ForgeData {
  const dataParts = [];
  let nextOffset = buffer.indexOf(FORGE_DATA_MAGIC);
  while (nextOffset >= 0) {
    const dataSource = new BufferSource(buffer, nextOffset);
    dataParts.push(handler.read(dataSource));
    nextOffset = buffer.indexOf(FORGE_DATA_MAGIC, dataSource.cursor());
  }
  return {
    DataParts: dataParts
  };
}

/**
 * Write ForgeData as buffer.
 */
export function writeForgeData(data: ForgeData, handler: TypeHandler<ForgeDataPartType>): Buffer {
  return Buffer.concat(data.DataParts.map(part => handler.write(part)).flat());
}
