import { AnvilTypes, ForgeData, registerTypes } from '@prekladyher/l10n-toolbox-engine/anvil';
import { TypeHandler, createResolver, withFileHandle, withFileSource } from '@prekladyher/l10n-toolbox-engine/base';
import { createCommand } from 'commander';
import { copyFile, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'node:path';
import { inspect } from 'util';
import { printJson } from '../utils/printJson.js';
import { printObject } from '../utils/printObject.js';
import { createIndexIterator, decodeDataPart, encodeDataPart } from './anvil/forge.js';

export const program = createCommand('anvil')
  .description('Handling Anvil engine files');

program
  .command('unpack')
  .description('Unpack files from Forge assert bundle')
  .requiredOption('-i, --input <path>', 'input bundle file')
  .requiredOption('-t, --target <path>', 'target directory for extracted asset files')
  .option('-n, --number <index>', 'asset index to extract', value => parseInt(value, 10))
  .option('-a, --asset-id <id>', 'asset identifier to extract', value => BigInt(value))
  .option('-l, --locate <offset>', 'locate asset residing at the given offset', value => BigInt(value))
  .option('-g, --grep <pattern>', 'find assets containing specified hex pattern', value => Buffer.from(value, 'hex'))
  .option('-s, --split', 'split forge file parts')
  .action(async ({ input, target, number, assetId, locate, grep, split, debug }) => {
    // Prepare resolver and data handlers
    const resolve = createResolver(registerTypes());
    const ForgeFile = resolve('ForgeFile') as TypeHandler<AnvilTypes.ForgeFile>;
    const ForgeDataPart = resolve('ForgeDataPart') as TypeHandler<AnvilTypes.ForgeData['DataParts'][number]>;
    // Process forge file
    withFileSource(input, async source => {
      const bundle = ForgeFile.read(source);
      // Iterate over all asset entries
      for await (const [indexEntry, assetIdx] of createIndexIterator(bundle)) {
        // Check if the entry matches selection
        if (number !== undefined && assetIdx !== number) {
          continue;
        }
        if (assetId !== undefined && indexEntry.FileDataID !== assetId) {
          continue;
        }
        if (locate !== undefined) {
          if (indexEntry.OffsetToRawDataTable > locate) {
            continue;
          }
          if (indexEntry.OffsetToRawDataTable + BigInt(indexEntry.RawDataSize) < locate) {
            continue;
          }
        }
        // Extract asset data table
        console.log(`Extracting asset:\n${inspect(indexEntry, { colors: true })}`);
        source.seek(Number(indexEntry.OffsetToRawDataTable));
        const dataBuffer = source.read(indexEntry.RawDataSize);
        // Try to extract all data parts
        const dataParts: Buffer[] = [];
        try {
          dataParts.push(...ForgeData.readForgeData(dataBuffer, ForgeDataPart).DataParts.map(decodeDataPart));
        } catch (error) {
          console.error(`Unable to decode data for asset ${indexEntry.FileDataID} at index ${assetIdx} and offset ${indexEntry.OffsetToRawDataTable}: ${error}`);
          continue;
        }
        // Check for grep pattern
        if (grep !== undefined) {
          if (dataParts.some(part => part.indexOf(grep) >= 0)) {
            console.log(`Matched asset ID ${indexEntry.FileDataID} under index ${assetIdx}`);
          } else {
            continue; // No grep match
          }
        }
        // Write output to file or stdout
        console.log(`Unpacking asset: ${indexEntry.FileDataID}`);
        if (!split) {
          await writeFile(join(target, `${indexEntry.FileDataID}.data`), Buffer.concat(dataParts));
        } else {
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
  .option('-u, --uncompressed', 'ignore asset compression', false)
  .option('-d, --data', 'interpret source as raw data', false)
  .option('-e, --erase', 'erase (zero out) original data', false)
  .action(async ({ input, assetId, source, target, uncompressed, erase, data }) => {
    // Prepare resolver and data handlers
    const resolve = createResolver(registerTypes());
    const ForgeFile = resolve('ForgeFile') as TypeHandler<AnvilTypes.ForgeFile>;
    const ForgeDataPart = resolve('ForgeDataPart') as TypeHandler<AnvilTypes.ForgeData['DataParts'][number]>;
    // Read forge file header
    const bundle = await withFileSource(input, async source => ForgeFile.read(source));
    // Find asset index
    const indexMatch = Array.from(createIndexIterator(bundle)).find(([indexEntry]) => indexEntry.FileDataID === assetId);
    if (!indexMatch) {
      throw `Unable to find asset ${assetId}`;
    }
    const [indexEntry, , indexOffset] = indexMatch;
    // Read original asset data
    const assetData = await withFileHandle(input, 'r', async handle => {
      const dataBuffer = Buffer.alloc(indexEntry.RawDataSize);
      await handle.read(dataBuffer, 0, dataBuffer.length, Number(indexEntry.OffsetToRawDataTable));
      return ForgeData.readForgeData(dataBuffer, ForgeDataPart);
    });
    // Read and prepare final override asset data
    const overrideSource = await readFile(source);
    if (data) {
      const ForgeDataFile = resolve('ForgeDataFile') as TypeHandler<AnvilTypes.ForgeDataFile>;
      const overrideAsset = Buffer.concat(ForgeDataFile.write({ FileDataID: assetId, EntryData: overrideSource }));
      encodeDataPart(assetData.DataParts[0], overrideAsset.subarray(0, 16), true);
      encodeDataPart(assetData.DataParts[1], overrideAsset.subarray(16), uncompressed);
    } else {
      encodeDataPart(assetData.DataParts[0], overrideSource.subarray(0, 16), true);
      encodeDataPart(assetData.DataParts[1], overrideSource.subarray(16), uncompressed);
    }
    const overrideData = ForgeData.writeForgeData(assetData, ForgeDataPart);
    // Create target copy of the asset bundle
    const fileInfo = await stat(input);
    await copyFile(input, target);
    // Append asset data and override offset
    await withFileHandle(target, 'r+', async (handle) => {
      if (erase) {
        console.error(`Clearing original asset data at offset: ${indexEntry.OffsetToRawDataTable}`);
        handle.write(Buffer.alloc(indexEntry.RawDataSize), 0, indexEntry.RawDataSize, Number(indexEntry.OffsetToRawDataTable));
      }
      console.error(`Updating index table offset at ${indexOffset} to ${fileInfo.size}`);
      await handle.writev(resolve('int64').write(BigInt(fileInfo.size)), Number(indexOffset));
      await handle.writev(resolve('int32').write(overrideData.length), Number(indexOffset) + 16);
      await handle.writev([overrideData], fileInfo.size);
    });
  });

program
  .command('read')
  .description('Extract Anvil asset data into JSON-like model')
  .requiredOption('-i, --input <path>', 'input data file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. ForgeDataFile)')
  .option('-s, --select <path>', 'JSON path transform (e.g. $.mSource.mTerms[*].Term)')
  .option('-d, --depth <depth>', 'inspection path depth', value => parseInt(value, 10), Infinity)
  .option('-j, --json', 'return as valid raw JSON')
  .option('-o, --output <path>', 'write to file instead of stdout')
  .action(async ({ input, type, select, depth, json, output }) => {
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
