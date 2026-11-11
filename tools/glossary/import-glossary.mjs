import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/cooking-glossary-import.json'), 'utf8'));

/** The supplied text has a few em dashes; the site does not use them. */
const plain = (text) => text.replace(/\s+—\s+/g, ', ').replace(/—/g, '-');

const slug = (text) =>
	text
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

/**
 * What the page loads: the categories, and the terms with both languages. The supplied Markdown stays untouched
 * (its hash is checked); the format is "## Category EN / UA (n)", then per entry "### Term EN / UA", "**EN:**",
 * "**UA:**" and the entry id in backticks.
 */
export function build() {
	const raw = fs.readFileSync(path.join(root, 'content/cooking-glossary/cooking_glossary_en_ua_289.md'));
	assert.equal(createHash('sha256').update(raw).digest('hex'), manifest.files['cooking_glossary_en_ua_289.md'], 'Changed original');
	const text = raw.toString('utf8').replace(/\r/g, '').replace(/^﻿/, '');

	const sections = [];
	const terms = [];
	const ids = new Set();
	const parts = text.split(/^## /m).slice(1);
	for (const part of parts) {
		const head = /^(.+?) \/ (.+?) \((\d+)\)\n/.exec(part);
		assert(head, `Bad category line: ${part.slice(0, 60)}`);
		const section = { id: slug(head[1]), title: { en: plain(head[1]), ua: plain(head[2]) } };
		assert(!sections.some((s) => s.id === section.id), `Duplicate category ${section.id}`);
		const entries = [...part.matchAll(/^### (.+?) \/ (.+)\n\n\*\*EN:\*\* (.+)\n\n\*\*UA:\*\* (.+)\n\n`([a-z0-9-]+)`/gm)];
		assert.equal(entries.length, Number(head[3]), `${section.id}: entry count matches the heading`);
		assert.equal([...part.matchAll(/^### /gm)].length, entries.length, `${section.id}: every entry is well formed`);
		for (const [, termEn, termUa, defEn, defUa, id] of entries) {
			assert(!ids.has(id), `Duplicate id ${id}`);
			ids.add(id);
			for (const value of [termEn, termUa, defEn, defUa]) assert(value.trim(), `${id}: empty text`);
			terms.push([id, sections.length, plain(termEn), plain(termUa), plain(defEn), plain(defUa)]);
		}
		sections.push(section);
	}
	assert.equal(terms.length, manifest.entries, 'entry count matches the archive');
	assert.equal(sections.length, manifest.categories, 'category count matches the archive');
	assert(!JSON.stringify(terms).includes('—'), 'no em dash is left');
	return JSON.stringify({ sections, terms });
}

export const OUTPUT = 'src/data/cooking/glossary.json';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const built = build();
	fs.writeFileSync(path.join(root, OUTPUT), built);
	const data = JSON.parse(built);
	console.log(`Imported ${data.terms.length} glossary terms in ${data.sections.length} categories.`);
}
