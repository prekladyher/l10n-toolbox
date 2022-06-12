const fs = require('fs');
const { program } = require('commander');

const { createResolver, withFileSource, withFileSink } = require('@prekladyher/engine-base');
const { registerTypes } = require('@prekladyher/engine-unreal');

const INSPECT_OPTS = {
  depth: null,
  maxArrayLength: Infinity,
  maxStringLength: Infinity,
  breakLength: Infinity,
  showHidden: false,
  compact: false
};

program
  .name('unreal')
  .description('Handling Unreal Engine files');

program
  .command('read')
  .description('Extract Unreal Engine asset data into JSON-like model')
  .requiredOption('-i, --input <path>', 'input data file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. TextLocalizationResource)')
  .option('-c, --config <path>', 'JSON file with engine config options',
    value => JSON.parse(fs.readFileSync(value, { encoding: "utf8"})),
    {})
  // TODO
  // .option('-s, --select <path>', 'JSON path transform (e.g. $.mSource.mTerms[*].Term)')
  .option('-d, --depth <depth>', 'inspection path depth',
    value => parseInt(value, 10),
    Infinity)
  .option('-j, --json', 'return as valid raw JSON')
  .action(({ input, type, config, select, depth, json }) => {
    const value = withFileSource(input, source => {
      const resolve = createResolver(registerTypes(config));
      return resolve(type).read(source);
    });
    const result = select ?
      require('jsonpath-plus').JSONPath({ path: select, json: value }) : value;
    if (json) {
      console.log(JSON.stringify(result, null, '  '));
    } else {
      console.dir(result, { ...INSPECT_OPTS, depth });
    }
  });

program.command('write')
  .description('Write Unreal Engine asset JSON as asset data file')
  .requiredOption('-i, --input <path>', 'input JSON file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. TextLocalizationResource)')
  .requiredOption('-o, --output <path>', 'output asset file')
  .option('-c, --config <path>', 'JSON file with engine config options',
    value => JSON.parse(fs.readFileSync(value, { encoding: "utf8"})),
    {})
  .action(({ input, output, type, config }) => {
    const value = JSON.parse(fs.readFileSync(input, { encoding: "utf8" }));
    withFileSink(output, sink => {
      const resolve = createResolver(registerTypes(config));
      resolve(type).write(value).forEach(buffer => sink.write(buffer));
    });
  });

program.parse();
