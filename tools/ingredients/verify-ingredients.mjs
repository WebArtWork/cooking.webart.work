import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build, OUTPUT } from './import-ingredients.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const expected = build();
assert.equal(
	fs.readFileSync(path.join(root, OUTPUT), 'utf8'),
	expected,
	'Out of date, run npm run ingredients:import',
);
const data = JSON.parse(expected);
console.log(`Verified ${data.items.length} ingredients in ${data.categories.length} categories, in both languages.`);
