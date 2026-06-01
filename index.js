'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

class EnvSync {
  constructor(opts = {}) {
    this.envFiles = opts.envFiles || ['.env', '.env.local'];
    this.ignore = new Set(opts.ignore || []);
    this.platform = opts.platform || 'auto';
  }

  load(projectRoot = process.cwd()) {
    const merged = {};
    for (const file of this.envFiles) {
      const p = path.join(projectRoot, file);
      if (!fs.existsSync(p)) continue;
      const parsed = dotenv.parse(fs.readFileSync(p));
      for (const [k, v] of Object.entries(parsed)) {
        if (this.ignore.has(k)) continue;
        merged[k] = v;
      }
    }
    return merged;
  }

  diff(envA, envB) {
    const added = [];
    const removed = [];
    const changed = [];

    for (const k of Object.keys(envA)) {
      if (!(k in envB)) {
        removed.push(k);
      } else if (envA[k] !== envB[k]) {
        changed.push(k);
      }
    }
    for (const k of Object.keys(envB)) {
      if (!(k in envA)) added.push(k);
    }

    return { added, removed, changed };
  }

  resolvePlatform() {
    if (this.platform !== 'auto') return this.platform;
    return process.platform;
  }

  write(target, env) {
    const lines = Object.entries(env)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    fs.writeFileSync(target, lines + '\n');
  }
}

module.exports = EnvSync;
module.exports.EnvSync = EnvSync;
