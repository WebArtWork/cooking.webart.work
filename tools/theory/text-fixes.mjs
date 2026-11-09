import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
/** Line-level edits to the supplied lessons, keyed "NNN.md:line" (content/text-fixes.json). */
const fixes = JSON.parse(fs.readFileSync(path.join(root, 'content/text-fixes.json'), 'utf8'));

/**
 * The supplied Markdown stays untouched on disk (its hash is checked). Typography fixes, such as dashes
 * rewritten into plain punctuation, are applied to its text here, and only where the line still matches.
 */
export function applyTextFixes(file, source) {
	const lines = source.split('\n');
	for (const [key, fix] of Object.entries(fixes)) {
		const [name, line] = key.split(':');
		if (name !== file) continue;
		if (lines[Number(line) - 1] !== fix.from) throw new Error(`Text fix does not match ${key}`);
		lines[Number(line) - 1] = fix.to;
	}
	return lines.join('\n');
}
