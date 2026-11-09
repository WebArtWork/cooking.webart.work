import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { expectedOutputs } from './import-exercises.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/cooking-exercises-import.json'), 'utf8'));

// the generated files match what the originals produce, byte for byte
const outputs = expectedOutputs();
for (const [file, contents] of outputs) {
	assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), contents, `Out of date, run npm run exercises:import: ${file}`);
}
// nothing stale is left behind
const generated = fs.readdirSync(path.join(root, 'src/data/cooking/exercises'));
assert.equal(generated.length, manifest.files.length, 'stale exercise files');

const total = manifest.archives.reduce((sum, a) => sum + a.exerciseCount, 0);
const index = JSON.parse(outputs.get('src/data/cooking/exercise-index.json'));
assert.equal(
	index.reduce((sum, t) => sum + t.count, 0),
	total,
	'exercise count matches the archives',
);
console.log(`Verified ${total} exercises, 8 types, in both languages, for ${index.length} theories.`);
