const fs = require('fs');
const { program } = require('commander');

const { withFileSource, withFileSink } = require('@prekladyher/engine-base');
const { createResolver, createSchema } = require('@prekladyher/engine-unity');

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

program
  .command('read')
  .description('Extract Unity asset data into JSON-like model')
  .requiredOption('-i, --input <path>', 'input data file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. LanguageSourceAsset)')
  .option('-f, --flags <path>', 'JSON file with schema flags',
    value => JSON.stringify(fs.readFileSync(value, { encoding: "utf8"})),
    {})
  .option('-s, --select <path>', 'JSON path transform (e.g. $.mSource.mTerms[*].Term)')
  .option('-d, --depth <depth>', 'inspection path depth',
    value => parseInt(options.depth, 10),
    Infinity)
  .option('-j, --json', 'return as valid raw JSON')
  .action(({ input, type, flags, select, depth, json }) => {
    const value = withFileSource(input, source => {
      const resolve = createResolver(createSchema(flags));
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
  .description('Write Unity asset JSON as asset data file')
  .requiredOption('-i, --input <path>', 'input JSON file')
  .requiredOption('-t, --type <type>', 'asset data type (e.g. LanguageSourceAsset)')
  .requiredOption('-o, --output <path>', 'output asset file')
  .option('-f, --flags <path>', 'JSON file with schema flags',
    value => JSON.stringify(fs.readFileSync(value, { encoding: "utf8"})),
    {})
  .action(({ input, output, type, flags }) => {
    const value = JSON.parse(fs.readFileSync(input, { encoding: "utf8" }));
    withFileSink(output, sink => {
      const resolve = createResolver(createSchema(flags));
      resolve(type).write(value).forEach(buffer => sink.write(buffer));
    });
  });

program.parse();
