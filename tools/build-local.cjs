// Package the pinned, standalone Three.js module as a classic script for file://.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/three.module.js'), 'utf8');
const classic = source.replace(/export\s*\{([^}]+)\};\s*$/, (_, names) => `return {${names}};`);
if (classic === source) throw new Error('Unexpected Three.js export format');
fs.writeFileSync(path.join(root, 'assets/three.local.js'), `window.ArchiveThree = (() => {\n${classic}\n})();\n`);
const seal = fs.readFileSync(path.join(root, 'assets/seal.png')).toString('base64');
fs.writeFileSync(path.join(root, 'assets/seal-data.js'), `window.ArchiveSeal = 'data:image/png;base64,${seal}';\n`);
