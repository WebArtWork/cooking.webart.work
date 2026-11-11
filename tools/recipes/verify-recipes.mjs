import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build, INDEX_FILE, LOADERS_FILE } from './import-recipes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const built = build();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
assert.equal(read(INDEX_FILE), built.index, `Out of date, run npm run recipes:import: ${INDEX_FILE}`);
assert.equal(read(LOADERS_FILE), built.loaders, `Out of date, run npm run recipes:import: ${LOADERS_FILE}`);
for (const [file, text] of Object.entries(built.files)) assert.equal(read(file), text, `Out of date, run npm run recipes:import: ${file}`);
const onDisk = fs.readdirSync(path.join(root, 'src/data/cooking/recipes'));
assert.equal(onDisk.length, built.count, 'No stray recipe files');
console.log(`Verified ${built.count} recipes.`);
