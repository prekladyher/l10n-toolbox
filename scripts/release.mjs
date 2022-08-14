// inspired by https://github.com/vuejs/core/blob/main/scripts/release.js
import chalk from 'chalk';
import glob from 'fast-glob';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

async function main() {
  const targetVersion = process.argv[2];
  if (!targetVersion) {
    console.error(`Usa§ge: release <version>`);
    process.exit(1);
  }

  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/g.test(targetVersion)) {
    console.error(`Invalid release version: ${targetVersion}`);
    pocess.exit(1);
  }

  try {
    await exec('git', 'diff', '--quiet');
  } catch (error) {
    console.error(`Working tree probably dirty`);
    process.exit(1);
  }

  report('Running tests')
  await runTests();

  report('Updating package.json files')
  await updateVersions('package.json', targetVersion)
  await updatePackages(targetVersion);

  report('Updating package-lock.json file')
  await exec('npm', 'install');

  report('Creating git commit and tag')
  await exec('git', 'add', '.');
  await exec('git', 'commit', '-m', `Release v${targetVersion}`);
  await exec('git', 'tag', /* '-s', */ '-m', `Release v${targetVersion}`, `v${targetVersion}`);
}

function exec(command, ...args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('exit', code => code === 0 ? resolve() : reject(code));
  });
}

function report(message) {
  console.log(`${chalk.red('[RELEASE]')} ${message}`);
}

async function runTests() {
  await exec('npm', 'run', 'test', 'run');
}

async function updatePackages(version) {
  for (const file of await glob('packages/*/package.json')) {
    await updateVersions(file, version);
  }
}

async function updateVersions(file, version) {
  const manifest = JSON.parse((await readFile(file)).toString());
  manifest.version = version;
  updateDependencies(manifest.dependencies || {}, version);
  updateDependencies(manifest.peerDependencies || {}, version);
  await writeFile(file, JSON.stringify(manifest, null, '  ') + '\n');
}

const WORKSPACE_PREFIX = '@prekladyher/';

function updateDependencies(dependencies, version) {
  for (const name of Object.keys(dependencies)) {
    if (name.startsWith(WORKSPACE_PREFIX)) {
      dependencies[name] = version;
    }
  }
}

main();
