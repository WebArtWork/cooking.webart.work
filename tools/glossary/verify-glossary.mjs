import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build, OUTPUT } from './import-glossary.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const built = build();
assert.equal(fs.readFileSync(path.join(root, OUTPUT), 'utf8'), built, `Out of date, run npm run glossary:import: ${OUTPUT}`);
const data = JSON.parse(built);
console.log(`Verified ${data.terms.length} glossary terms in ${data.sections.length} categories.`);
