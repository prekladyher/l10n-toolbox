import { AnvilTypes, registerTypes } from '@prekladyher/l10n-toolbox-engine/anvil';
import { BufferSource, createResolver, TypeHandler, withFileHandle, withFileSource } from '@prekladyher/l10n-toolbox-engine/base';
import noodle from '@prekladyher/node-oodle-data';
import chalk from 'chalk';
import { createCommand } from 'commander';
import { copyFile, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'node:path';
import { inspect } from 'util';
import { loadConfig } from '../utils/loadConfig.js';
import { printJson } from '../utils/printJson.js';
import { printObject } from '../utils/printObject.js';


export const program = createCommand('anvil')
  .description('Handling Anvil engine files');

const DATA_MAGIC = Buffer.from('33AAFB5799FA0410', 'hex');

function writeDebug(message: string) {
  console.error(`${chalk.yellow('[DEBUG]')} ${message}`);
}

function readForgeData<T>(handler: TypeHandler<T>, buffer: Buffer, debug = false): T[] {
  const result = [];
  let nextOffset = buffer.indexOf(DATA_MAGIC);
  while (nextOffset >= 0) {
    debug && writeDebug(`Extracting data part at offset: ${chalk.red(nextOffset)}`);
    const dataSource = new BufferSource(buffer, nextOffset);
    result.push(handler.read(dataSource));
    debug && writeDebug(`Extracted number of bytes: ${chalk.red(dataSource.cursor() - nextOffset)}`);
    nextOffset = buffer.indexOf(DATA_MAGIC, dataSource.cursor());
  }
  return result;
}

function decodeForgeData(data: AnvilTypes.ForgeData, debug = false): Buffer {
  const result: Buffer[] = [];
  debug && writeDebug(`Decoding data part:\n${inspect(data, { colors: true })}`);
  for (let i = 0; i < data.DataChunks.length; i++) {
    const dataChunk = data.DataChunks[i];
    const rawData = Buffer.alloc(data.DataTable[i].UncompressedSize);
    if (data.DataTable[i].CompressedSize === data.DataTable[i].UncompressedSize) {
      dataChunk.Data.copy(rawData);
    } else {
      debug && writeDebug(`Detected chunk compressor type: ${noodle.GetFirstChunkCompressor(dataChunk.Data)}`);
      noodle.Decompress(dataChunk.Data, rawData, rawData.length);
    }
    // TODO validate checksum?
    result.push(rawData);
  }
  return Buffer.concat(result);
}

const COMPRESSOR_TYPE = 9;

function compressDataBuffer(data: Buffer) {
  const result = Buffer.alloc((data.length + 15) >> 4 << 4);
  return result.slice(0, noodle.Compress(COMPRESSOR_TYPE, data, data.length, result));
}

const MAX_CHUNK_SIZE = 262144;

function createDataChunks(data: Buffer) {
  const result: Buffer[] = [];
  let offset = 0;
  while (offset < data.length) {
    result.push(data.slice(offset, Math.min(offset + MAX_CHUNK_SIZE, data.length)));
    offset += result[result.length - 1].length;
  }
  return result;
}

program
  .command('unpack')
  .description('Unpack files from Forge assert bundle')
  .requiredOption('-i, --input <path>', 'input bundle file')
  .requiredOption('-t, --target <path>', 'target directory for extracted asset files')
  .option('-s, --select <index>', 'select asset to extract', value => parseInt(value, 10))
  .option('-a, --asset-id <id>', 'asset identifier to extract', value => BigInt(value))
  .option('-r, --raw', 'output raw forge data entry')
  .option('-d, --debug', 'print additional debug information', false)
  .option('-g, --grep <pattern>', 'find assets with specified hex pattern', value => Buffer.from(value, 'hex'))
  .action(async ({ input, select, assetId, target, raw, debug, grep }) => {
    // Prepare resolver and data handlers
    const resolve = createResolver(registerTypes());
    const ForgeFile = resolve('ForgeFile') as TypeHandler<AnvilTypes.ForgeFile>;
    const ForgeData = resolve('ForgeData') as TypeHandler<AnvilTypes.ForgeData>;
    // Process forge file
    withFileSource(input, async source => {
      const bundle = ForgeFile.read(source);
      // Iterate over all asset entries
      for (let assetIdx = 0; assetIdx < bundle.IndexTable.length; assetIdx++) {
        const indexEntry = bundle.IndexTable[assetIdx];
        // Check if the entry matches selection
        if (select !== undefined && assetIdx !== select) {
          continue;
        }
        if (assetId !== undefined && indexEntry.FileDataID !== assetId) {
          continue;
        }
        // Extract asset data table
        debug && writeDebug(`Extracting asset:\n${inspect(indexEntry, { colors: true })}`);
        source.seek(Number(indexEntry.OffsetToRawDataTable));
        const dataBuffer = source.read(indexEntry.RawDataSize);
        // Try to extract all data parts
        const dataParts: Buffer[] = [];
        try {
          for (const forgeData of readForgeData(ForgeData, dataBuffer, debug)) {
            dataParts.push(decodeForgeData(forgeData, debug));
          }
        } catch (error) {
          console.error(`Unable to decode data for asset ${indexEntry.FileDataID} at index ${assetIdx} and offset ${indexEntry.OffsetToRawDataTable}`);
          debug && console.error(error);
        }
        // Check for grep pattern
        if (grep !== undefined) {
          if (dataParts.some(part => part.indexOf(grep) >= 0)) {
            console.error(`Matched asset ID ${indexEntry.FileDataID} under index ${assetIdx}`);
          } else {
            continue; // No grep match
          }
        }
        // Write output to file or stdout
        if (raw) {
          await writeFile(join(target, `${indexEntry.FileDataID}.data`), dataBuffer);
        } else {
          !dataParts.length && debug && writeDebug(`Missing data parts for asset: ${assetIdx}`);
          for (let partIdx = 0; partIdx < dataParts.length; partIdx++) {
            await writeFile(join(target, `${indexEntry.FileDataID}_${partIdx}.data`), dataParts[partIdx]);
          }
        }
      }
    });
  });

program
  .command('repack')
  .description('Repack files from Forge assert bundle')
  .requiredOption('-i, --input <path>', 'input bundle file')
  .requiredOption('-a, --asset-id <id>', 'asset identifier to override', value => BigInt(value))
  .requiredOption('-s, --source <path>', 'source asset data file')
  .requiredOption('-t, --target <path>', 'path for the created asset bundle')
  .option('-r, --raw', 'use raw asset data (ignore compression)', false)
  .option('-e, --erase', 'erase (zero out) original data', false)
  .option('-d, --debug', 'print additional debug information', false)
  .action(async ({ input, assetId, source, target, raw, debug, erase }) => {
    // Prepare resolver and data handlers
    const resolve = createResolver(registerTypes());
    const ForgeFile = resolve('ForgeFile') as TypeHandler<AnvilTypes.ForgeFile>;
    const ForgeData = resolve('ForgeData') as TypeHandler<AnvilTypes.ForgeData>;
    const int32 = resolve('int32');
    const int64 = resolve('int64');
    // Read forge file header
    const bundle = await withFileSource(input, async source => ForgeFile.read(source));
    // Find asset index
    const assetIdx = bundle.IndexTable.findIndex(entry => entry.FileDataID === assetId);
    if (assetIdx < 0) {
      throw `Unable to find asset ${assetId}`;
    }
    const indexEntry = bundle.IndexTable[assetIdx];
    // Read original asset data
    const dataBuffer = Buffer.alloc(indexEntry.RawDataSize);
    const dataParts: AnvilTypes.ForgeData[] = [];
    await withFileHandle(input, 'r', async handle => {
      await handle.read(dataBuffer, 0, dataBuffer.length, Number(indexEntry.OffsetToRawDataTable));
      dataParts.push(...readForgeData(ForgeData, dataBuffer));
    });
    // Read override asset data
    const overrideSource = await readFile(source);
    const overrideChunks = createDataChunks(overrideSource);
    const DataTable: AnvilTypes.ForgeData['DataTable'] = [];
    const DataChunks: AnvilTypes.ForgeData['DataChunks'] = [];
    debug && writeDebug(`Data split to ${overrideChunks.length} chunks`);
    overrideChunks.forEach((chunk) => {
      const compressed = raw ? chunk : compressDataBuffer(chunk);
      DataTable.push({ UncompressedSize: chunk.length, CompressedSize: compressed.length });
      DataChunks.push({ Checksum: 0, Data: compressed });
    });
    dataParts[1].DataChunks = DataChunks;
    dataParts[1].DataTable = DataTable;
    const overrideData = Buffer.concat([...ForgeData.write(dataParts[0]), ...ForgeData.write(dataParts[1])]);
    // Create target copy of the asset bundle
    const fileInfo = await stat(input);
    await copyFile(input, target);
    // Append asset data and override offset
    await withFileHandle(target, 'r+', async (handle) => {
      if (erase) {
        debug && writeDebug(`Clearing original asset data at offset: ${indexEntry.OffsetToRawDataTable}`);
        handle.write(
          Buffer.alloc(indexEntry.RawDataSize),
          0,
          indexEntry.RawDataSize,
          Number(indexEntry.OffsetToRawDataTable)
        );
      }
      debug && writeDebug(`Asset number: ${assetIdx}`);
      const offsetOffset = Number(bundle.DataHeader.OffsetToIndexTable) + 20 * assetIdx;
      debug && writeDebug(`Position of index table offset: ${offsetOffset}`);
      await handle.writev(int64.write(BigInt(fileInfo.size)), offsetOffset);
      await handle.writev(int32.write(overrideData.length), offsetOffset + 16);
      debug && writeDebug(`Position of override asset data: ${fileInfo.size}`);
      await handle.writev([overrideData, Buffer.alloc(1024)], fileInfo.size);
    });
  });

program
  .command('read')
  .description('Extract Anvil asset data into JSON-like model')
  .requiredOption('-i, --input <path>', 'input data file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. LanguageSourceAsset)')
  .option('-c, --config <path>', 'JSON file with engine config options', loadConfig, {})
  .option('-s, --select <path>', 'JSON path transform (e.g. $.mSource.mTerms[*].Term)')
  .option('-d, --depth <depth>', 'inspection path depth', value => parseInt(value, 10), Infinity)
  .option('-j, --json', 'return as valid raw JSON')
  .option('-o, --output <path>', 'write to file instead of stdout')
  .action(async ({ input, type, config, select, depth, json, output }) => {
    const value = await withFileSource(input, async source => {
      const resolve = createResolver(registerTypes());
      return resolve(type).read(source);
    });
    const result = select ?
      (await import('jsonpath-plus')).JSONPath({ path: select, json: value }) : value;
    if (output) {
      await writeFile(output, JSON.stringify(result, null, '  '));
    } else if (json) {
      printJson(result);
    } else {
      printObject(result, depth);
    }
  });
