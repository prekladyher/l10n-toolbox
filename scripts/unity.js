const fs = require('fs').promises;
const { program } = require('commander');
const { schema, createResolver, decodeAsset } = require('@prekladyher/engine-unity');

const INSPECT_OPTS = {
  depth: null,
  maxArrayLength: Infinity,
  maxStringLength: Infinity,
  breakLength: Infinity,
  showHidden: false,
  compact: false
};

program
  .name('unity')
  .description('Handling Unity engine files');

program.command('read')
  .description('Extract Unity script data into JSON model')
  .argument('<type>', 'asset data type (e.g. LanguageSourceAsset)')
  .argument('<file>', 'script data file')
  .option('-f, --flags <path>', 'JSON file with schema flags')
  .option('-p, --path <path>', 'JSON path transform (e.g. $.mSource.mTerms[*].Term)')
  .option('-d, --depth <depth>', 'inspection path depth')
  .option('-j, --json', 'return as valid raw JSON')
  .action(async (type, file, options) => {
    let flags = {};
    if (options.flags) {
      flags = JSON.parse((await fs.readFile(options.flags)).toString());
    }
    let decoded = decodeAsset(type, await fs.readFile(file), createResolver(schema, flags));
    if (options.path) {
      const { JSONPath } = await import('jsonpath-plus');
      decoded = JSONPath({ path: options.path, json: decoded });
    }
    if (options.json) {
      BigInt.prototype.toJSON = function() { return Number(this); };
      console.log(JSON.stringify(decoded, null, '  '));
    } else {
      console.dir(decoded, {
        ...INSPECT_OPTS,
        depth: options.depth !== undefined ? parseInt(options.depth, 10) : Infinity,
      });
    }
  });

program.parse();
