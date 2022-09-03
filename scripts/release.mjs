// inspired by https://github.com/vuejs/core/blob/main/scripts/release.js
import chalk from 'chalk';
import { program } from 'commander';
import glob from 'fast-glob';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'path';
import semver from 'semver';

program
  .option('--dry-run', 'do not make any changes')
  .option('--no-validate', 'do not validate version change')
  .option('--no-push', 'do not push git changes')
  .option('--no-publish', 'do not publish to npm registry')
  .argument('[<version> | major | minor | patch ]')
  .argument('<package-path>');

program.parse();

const DRY_RUN = program.opts().dryRun;

const NPM_CMD = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

function report(message) {
  console.log(`${chalk.bold.cyan('[RELEASE]')} ${message}`);
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

function updateDependencies(manifest, name, version) {
  if (manifest?.dependencies?.[name]) {
    manifest.dependencies[name] = version;
  }
  if (manifest?.peerDependencies?.[name]) {
    manifest.peerDependencies[name] = version;
  }
}

async function main() {
  const { validate, push, publish } = program.opts();

  const workspace = program.args[1];
  const workspaceParams = ['-w', workspace];

  const releaseManifest = await loadJson(join(workspace, 'package.json'));

  const sourceVersion = releaseManifest.version;
  const targetVersion = semver.valid(program.args[0])
    ? program.args[0]
    : semver.inc(sourceVersion, program.args[0]);

  if (validate && semver.gte(sourceVersion, targetVersion)) {
    console.error(`Invalid version change from ${sourceVersion} to ${targetVersion}`);
    process.exit(1);
  }

  const releaseName = `${releaseManifest.name.replace(/^@[^/]+\//, '')}-${targetVersion}`;
  report(`Starting release ${chalk.green(releaseName)}`);

  try {
    await exec('git', 'diff', '--quiet', 'HEAD');
  } catch (error) {
    console.error(`Working tree probably dirty`);
    process.exit(1);
  }

  report('Running tests');
  await exec(NPM_CMD, 'run', ...workspaceParams, '--if-present', 'test');

  report(`Updating package version from ${chalk.red(sourceVersion)} to ${chalk.green(targetVersion)}`);
  releaseManifest.version = targetVersion;
  await saveJson(join(workspace, 'package.json'), releaseManifest);

  report(`Updating package references to ${chalk.green(releaseManifest.name)}`);
  for (const file of await glob('packages/*/package.json')) {
    const manifest = await loadJson(file);
    updateDependencies(manifest, releaseManifest.name, targetVersion);
    saveJson(file, manifest);
  }

  report('Updating package-lock.json file');
  await exec(NPM_CMD, 'install');

  report(`Creating git commit and tag ${chalk.green(releaseName)}`);
  await exec('git', 'add', '.');
  await exec('git', 'commit', '-m', `Release ${releaseName}`);
  await exec('git', 'tag', '-m', `Release ${releaseName}`, releaseName);

  report('Running clean build before publishing');
  await exec(NPM_CMD, 'run', ...workspaceParams, 'build');

  if (push) {
    report(`Pushing git commit and tag`);
    await exec('git', 'push', '--atomic', 'origin', 'HEAD', releaseName);
  }

  if (publish) {
    report(`Publishing to npm registry`);
    await exec(NPM_CMD, 'publish', '-w', program.args[1]);
  }
}

main();
