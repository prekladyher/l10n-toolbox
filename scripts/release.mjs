import chalk from 'chalk';
import { program } from 'commander';
import glob from 'glob';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import semver from 'semver';

program
  .description('Prepare and perform project release.')
  .option('--dry-run', 'do not commit or push any changes')
  .option('--no-validate', 'do not validate version change')
  .option('--no-test', 'do not run test')
  .option('--no-publish', 'do not publish to npm registry')
  .argument('version', 'version specifier ( <version> | major | minor | patch> )');

program.parse();

const DRY_RUN = program.opts().dryRun;

function report(message) {
  console.log(`${chalk.bold.magenta('[RELEASE]')} ${message}`);
}

async function exec(command, ...args) {
  if (DRY_RUN) {
    console.log(`${chalk.yellow('[EXEC]')} ${command} ${args.join(' ')}`);
  } else {
    return await new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: 'inherit' });
      child.on('exit', code => code === 0 ? resolve(null) : reject(code));
    });
  }
}

async function loadJson(file) {
  return JSON.parse((await readFile(file)).toString('utf-8'));
}

async function saveJson(file, content) {
  await writeFile(file, JSON.stringify(content, null, '  ') + '\n');
}

function updateVersions(dependencies, version) {
  Object.keys(dependencies || {})
    .filter(name => name.startsWith('@prekladyher/l10n-toolbox'))
    .forEach(name => dependencies[name] = version);
}

async function main() {
  const { validate, test, publish } = program.opts();

  const rootManifest = await loadJson('package.json');
  if (rootManifest.name !== '@prekladyher/l10n-toolbox-monorepo') {
    console.error('This script must be executed from project root');
    process.exit(1);
  }

  const sourceVersion = rootManifest.version;
  const /** @type any */ targetVersion = semver.valid(program.args[0])
    ? program.args[0]
    : semver.inc(sourceVersion, /** @type any */ (program.args[0]));

  if (validate && semver.gte(sourceVersion, targetVersion)) {
    console.error(`Invalid version change from ${sourceVersion} to ${targetVersion}`);
    process.exit(1);
  }

  const releaseName = `${targetVersion}`;
  report(`Starting release ${chalk.green(releaseName)}`);

  try {
    await exec('git', 'diff', '--quiet', 'HEAD');
  } catch (error) {
    console.error(`Working tree probably dirty`);
    process.exit(1);
  }

  const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  if (test) {
    report('Running tests');
    await exec(NPM_COMMAND, 'run', 'test');
  }

  report(`Updating package version from ${chalk.red(sourceVersion)} to ${chalk.green(targetVersion)}`);
  rootManifest.version = targetVersion;
  await saveJson('package.json', rootManifest);

  report(`Updating cross package references`);
  for (const file of await promisify(glob)('packages/*/package.json')) {
    const manifest = await loadJson(file);
    manifest.version = targetVersion;
    updateVersions(manifest.dependencies, targetVersion);
    updateVersions(manifest.devDependencies, targetVersion);
    updateVersions(manifest.peerDependencies, targetVersion);
    updateVersions(manifest.optionalDependencies, targetVersion);
    await saveJson(file, manifest);
  }

  report('Updating package-lock.json file');
  await exec(NPM_COMMAND, 'install');

  report(`Creating git commit and tag ${chalk.green(releaseName)}`);
  await exec(
    'git',
    'add',
    'package.json',
    'package-lock.json',
    'packages/*/package.json'
  );
  await exec('git', 'commit', '-m', `Release ${releaseName}`);
  await exec('git', 'tag', '-m', `Release ${releaseName}`, releaseName);

  report('Running clean build before publishing');
  await exec(NPM_COMMAND, 'run', 'build');

  if (publish) {
    report(`Pushing git commit and tag`);
    await exec('git', 'push', '--atomic', 'origin', 'HEAD', releaseName);
  }

  if (publish) {
    report(`Publishing to npm registry`);
    await exec(NPM_COMMAND, 'publish', '-ws');
  }
}

try {
  await main();
} catch (error) {
  console.log(`Error during release execution: ${error?.toString()}`);
  process.exit(1);
}
