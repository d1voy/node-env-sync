#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const EnvSync = require('..');

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

function loadConfig(root = process.cwd()) {
  const p = path.join(root, '.envsync.json');
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    console.error(chalk.red('✗'), `Failed to parse .envsync.json: ${err.message}`);
    process.exit(1);
  }
}

function init() {
  const configPath = path.resolve('.envsync.json');
  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('!'), '.envsync.json already exists');
    return;
  }
  const defaults = {
    envFiles: ['.env', '.env.local'],
    ignore: ['NODE_ENV'],
    platform: 'auto',
  };
  fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2) + '\n');
  console.log(chalk.green('✓'), 'Created .envsync.json');
}

function sync(rest) {
  const targetIdx = rest.indexOf('--target');
  const target = targetIdx !== -1 ? rest[targetIdx + 1] : './';
  const config = loadConfig();
  const syncer = new EnvSync(config);
  const env = syncer.load();
  const outPath = path.join(path.resolve(target), '.env.local');
  syncer.write(outPath, env);
  console.log(chalk.green('✓'), `Wrote ${Object.keys(env).length} variables → ${outPath}`);
}

function diffCmd(rest) {
  const [a, b] = rest;
  if (!a || !b) {
    console.error(chalk.red('✗'), 'Usage: node-env-sync diff <envA> <envB>');
    process.exit(1);
  }
  const config = loadConfig();
  const syncer = new EnvSync(config);
  const envA = syncer.load(a);
  const envB = syncer.load(b);
  const { added, removed, changed } = syncer.diff(envA, envB);
  console.log(chalk.cyan(`Diff: ${a} → ${b}`));
  added.forEach((k) => console.log(chalk.green('  +'), k));
  removed.forEach((k) => console.log(chalk.red('  -'), k));
  changed.forEach((k) => console.log(chalk.yellow('  ~'), k));
}

function help() {
  console.log(`node-env-sync v${require('../package.json').version}

Usage:
  node-env-sync init                        Create .envsync.json
  node-env-sync sync --target <dir>         Sync env vars into target
  node-env-sync diff <envA> <envB>          Show diff between envs

Configuration: .envsync.json in project root
`);
}

switch (cmd) {
  case 'init':
    init();
    break;
  case 'sync':
    sync(rest);
    break;
  case 'diff':
    diffCmd(rest);
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    help();
    break;
  default:
    console.error(chalk.red('✗'), `Unknown command: ${cmd}`);
    help();
    process.exit(1);
}
