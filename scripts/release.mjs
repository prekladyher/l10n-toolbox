// inspired by https://github.com/vuejs/core/blob/main/scripts/release.js
import chalk from 'chalk';
import { program } from 'commander';
import glob from 'fast-glob';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'path';
import semver from 'semver';

program
  .option('--no-sign', 'do not sign git commit and tags')
  .option('--dry-run', 'do not make any changes')
  .option('-f, --force', 'do not validate version change')
  .option('--no-publish', 'do not publish to npm registry')
  .argument('[<version> | major | minor | patch ]')
  .argument('<package-path>');

program.parse();

function report(message) {
  console.log(`${chalk.red('[RELEASE]')} ${message}`);
}

async function main() {
  const { force, sign, publish, dryRun } = program.opts();

  const safeExec = async (command, ...args) => {
    if (dryRun) {
      console.log(`${chalk.yellow('[EXEC]')} ${command} ${args.join(' ')}`);
    } else {
      await new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit' });
        child.on('exit', code => code === 0 ? resolve() : reject(code));
      });
    }
  };

  const manifestPath = path.join(program.args[1], 'package.json');
  const manifest = JSON.parse((await readFile(manifestPath)).toString());

  const targetVersion = semver.valid(program.args[0])
    ? program.args[0]
    : semver.inc(manifest.version, program.args[0]);

  if (!force && semver.gte(manifest.version, targetVersion)) {
    console.error(`Invalid version change from ${manifest.version} to ${targetVersion}`);
    process.exit(1);
  }

  const releaseName = `${manifest.name.replace(/^@[^/]+\//, '')}-${targetVersion}`;
  report(`Starting release ${chalk.green(releaseName)}`);

  try {
    await safeExec('git', 'diff', '--quiet');
  } catch (error) {
    console.error(`Working tree probably dirty`);
    process.exit(1);
  }

  report('Running tests');
  await safeExec('npm', 'run', 'test', 'run');

  report(`Updating package version from ${chalk.red(manifest.version)} to ${chalk.green(targetVersion)}`);
  manifest.version = targetVersion;
  dryRun || await writeFile(manifestPath, JSON.stringify(manifest, null, '  ') + '\n');

  report(`Updating package references to ${chalk.green(manifest.name)}`)
  for (const file of await glob('packages/*/package.json')) {
    dryRun || await updateVersions(file, manifest.name, targetVersion);
  }

  report('Updating package-lock.json file');
  await safeExec('npm', 'install');

  report(`Creating git commit and tag ${chalk.green(releaseName)}`);
  await safeExec('git', 'add', '.');
  await safeExec('git', 'commit', '-m', `Release ${releaseName}`);
  await safeExec('git', 'tag', ...(sign ? ['-s'] : []), '-m', `Release ${releaseName}`, `${releaseName}`);

  if (publish) {
    report(`Publishing to npm registry`);
    await safeExec('npm', 'publish', '-w', program.args[1]);
  }
}

async function updateVersions(file, dependency, version) {
  const manifest = JSON.parse((await readFile(file)).toString());
  if (manifest.dependencies?.[dependency]) {
    manifest.dependencies[dependency] = version;
  }
  if (manifest.peerDependencies?.[dependency]) {
    manifest.peerDependencies[dependency] = version;
  }
  await writeFile(file, JSON.stringify(manifest, null, '  ') + '\n');
}

main();
