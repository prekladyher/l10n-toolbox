import { createResolver, withFileSink, withFileSource } from '@prekladyher/l10n-toolbox-engine/base';
import { registerTypes } from '@prekladyher/l10n-toolbox-engine/unity';
import { createCommand } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import { loadConfig } from '../utils/loadConfig.js';
import { printJson } from '../utils/printJson.js';
import { printObject } from '../utils/printObject.js';

export const program = createCommand('unity')
  .description('Handling Unity engine files');

program
  .command('read')
  .description('Extract Unity asset data into JSON-like model')
  .requiredOption('-i, --input <path>', 'input data file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. LanguageSourceAsset)')
  .option('-c, --config <path>', 'JSON file with engine config options', loadConfig, {})
  .option('-s, --select <path>', 'JSON path transform (e.g. $.mSource.mTerms[*].Term)')
  .option('-d, --depth <depth>', 'inspection path depth', value => parseInt(value, 10), Infinity)
  .option('-j, --json', 'return as valid raw JSON')
  .option('-o, --output <path>', 'write to file instead of stdout')
  .action(async ({ input, type, config, select, depth, json, output }) => {
    const value = withFileSource(input, source => {
      const resolve = createResolver(registerTypes(config));
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

program.command('write')
  .description('Write Unity asset JSON as asset data file')
  .requiredOption('-i, --input <path>', 'input JSON file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. LanguageSourceAsset)')
  .requiredOption('-o, --output <path>', 'output asset file')
  .option('-c, --config <path>', 'JSON file with engine config options', loadConfig, {})
  .action(({ input, output, type, config }) => {
    const value = JSON.parse(readFileSync(input, { encoding: "utf8" }));
    withFileSink(output, sink => {
      const resolve = createResolver(registerTypes(config));
      resolve(type).write(value).forEach(buffer => sink.write(buffer));
    });
  });
