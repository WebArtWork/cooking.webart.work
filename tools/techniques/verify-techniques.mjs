import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build, OUTPUTS } from './import-techniques.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const built = build();
for (const [key, file] of Object.entries(OUTPUTS)) {
	assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), built[key], `Out of date, run npm run techniques:import: ${file}`);
}
const data = JSON.parse(built.techniques);
const linked = data.items.filter((item) => item[8].length).length;
console.log(`Verified ${data.items.length} techniques in ${data.categories.length} categories, ${linked} linked to theories.`);
