import { AnvilTypes, registerTypes } from '@prekladyher/l10n-toolbox-engine/anvil';
import { BufferSource, createResolver, TypeHandler, withFileSource } from '@prekladyher/l10n-toolbox-engine/base';
import noodle from '@prekladyher/node-oodle-data';
import chalk from 'chalk';
import { createCommand } from 'commander';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../utils/loadConfig.js';
import { printJson } from '../utils/printJson.js';
import { printObject } from '../utils/printObject.js';

export const program = createCommand('anvil')
  .description('Handling Anvil engine files');

const DATA_MAGIC = Buffer.from('33AAFB5799FA0410', 'hex');

function writeDebug(message: string) {
  console.error(`${chalk.yellow('[DEBUG]')} ${message}`);
}

function decodeForgeData(data: AnvilTypes.ForgeData, debug = false): Buffer {
  const result: Buffer[] = [];
  debug && console.error(data);
  for (let i = 0; i < data.DataChunks.length; i++) {
    const dataChunk = data.DataChunks[i];
    const rawData = Buffer.alloc(data.DataTable[i].UncompressedSize);
    if (data.DataTable[i].CompressedSize === data.DataTable[i].UncompressedSize) {
      dataChunk.Data.copy(rawData);
    } else {
      noodle.Decompress(dataChunk.Data, rawData, rawData.length);
    }
    // TODO validate checksum?
    result.push(rawData);
  }
  return Buffer.concat(result);
}

program
  .command('unpack')
  .description('Unpack files from Forge assert bundle')
  .requiredOption('-i, --input <path>', 'input bundle file')
  .requiredOption('-t, --target <path>', 'target directory for extracted asset files')
  .option('-s, --select <index>', 'select asset to extract', value => parseInt(value, 10))
  .option('-c, --config <path>', 'JSON file with engine config options', loadConfig, {})
  .option('-d, --debug', 'print additional debug information', false)
  .action(async ({ input, config, select, target, debug }) => {
    // Prepare resolver and data handlers
    const resolve = createResolver(registerTypes());
    const ForgeFile = resolve('ForgeFile') as TypeHandler<AnvilTypes.ForgeFile>;
    const ForgeData = resolve('ForgeData') as TypeHandler<AnvilTypes.ForgeData>;
    // Process forge file
    const asset = withFileSource(input, source => {
      const bundle = ForgeFile.read(source);
      // Iterate over all asset entries
      for (let assetIdx = 0; assetIdx < bundle.IndexTable.length; assetIdx++) {
        const indexEntry = bundle.IndexTable[assetIdx];
        // Check if the entry matches selection
        if (select !== undefined && assetIdx != select) {
          continue;
        }
        // Extract asset data table
        debug && writeDebug(`Extracting asset at offset: ${chalk.red(indexEntry.OffsetToRawDataTable)}`);
        source.seek(Number(indexEntry.OffsetToRawDataTable));
        const dataBuffer = source.read(indexEntry.RawDataSize);
        // Try to extract all data parts
        const dataParts: Buffer[] = [];
        let nextOffset = dataBuffer.indexOf(DATA_MAGIC);
        while (nextOffset >= 0) {
          debug && writeDebug(`Extracting data part at offset: ${chalk.red(nextOffset)}`);
          const dataSource = new BufferSource(dataBuffer, nextOffset);
          dataParts.push(decodeForgeData(ForgeData.read(dataSource), debug));
          nextOffset = dataBuffer.indexOf(DATA_MAGIC, dataSource.cursor());
        }
        // Write output to file or stdout
        for (let partIdx = 0; partIdx < dataParts.length; partIdx++) {
          writeFileSync(join(target, `${assetIdx}_${partIdx}.data`), dataParts[partIdx]);
        }
      }
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
    const value = withFileSource(input, source => {
      const resolve = createResolver(registerTypes());
      return resolve(type).read(source);
    });
    const result = select ?
      (await import('jsonpath-plus')).JSONPath({ path: select, json: value }) : value;
    if (output) {
      writeFileSync(output, JSON.stringify(result, null, '  '));
    } else if (json) {
      printJson(result);
    } else {
      printObject(result, depth);
    }
  });
