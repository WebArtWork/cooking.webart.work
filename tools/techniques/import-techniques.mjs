import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = 'content/cooking-techniques/';
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/cooking-techniques-import.json'), 'utf8'));

const read = (name) => {
	const raw = fs.readFileSync(path.join(root, dir, name));
	assert.equal(createHash('sha256').update(raw).digest('hex'), manifest.files[name], `Changed original ${name}`);
	return JSON.parse(raw.toString('utf8').replace(/^﻿/, ''));
};
const text = (value, where) => {
	assert(value && typeof value.en === 'string' && value.en.trim(), `${where}: English missing`);
	assert(typeof value.ua === 'string' && value.ua.trim(), `${where}: Ukrainian missing`);
};

/**
 * What the app loads: the techniques (each with the theories that explain it and its safety flags), and a small
 * index from theory to techniques for the theory pages.
 */
export function build() {
	const source = read('techniques.json');
	const taxonomy = read('taxonomy.json');
	const info = read('manifest.json');
	const safety = read('safety_reference.json');
	const links = JSON.parse(fs.readFileSync(path.join(root, 'content/technique-theories.json'), 'utf8'));
	const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/cooking/catalog.json'), 'utf8'));
	const theoryIds = new Set(catalog.theories.map((t) => t.id));

	const categories = taxonomy.categories.map((c) => {
		text(c.name, `category ${c.id}`);
		c.subcategories.forEach((s) => text(s.name, `subcategory ${s.id}`));
		return { id: c.id, name: c.name, subs: c.subcategories.map((s) => ({ id: s.id, name: s.name })) };
	});
	const subIndex = new Map(categories.flatMap((c, ci) => c.subs.map((s, si) => [s.id, [ci, si]])));
	assert.equal(subIndex.size, categories.reduce((n, c) => n + c.subs.length, 0), 'duplicate subcategory ids');

	const flags = safety.groups.map((g) => {
		text(g.note, `safety ${g.id}`);
		return { id: g.id, note: g.note };
	});
	const ids = new Set(source.techniques.map((t) => t.id));
	for (const group of safety.groups) group.techniqueIds.forEach((id) => assert(ids.has(id), `safety group ${group.id}: unknown technique ${id}`));
	for (const [id, list] of Object.entries(links)) {
		assert(ids.has(id), `technique-theories: unknown technique ${id}`);
		list.forEach((theory) => assert(theoryIds.has(theory), `technique-theories ${id}: unknown theory ${theory}`));
	}

	const seen = new Set();
	const names = { en: new Set(), ua: new Set() };
	const items = source.techniques.map((t) => {
		assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.id), `${t.id}: id format`);
		assert(!seen.has(t.id), `${t.id}: duplicate id`);
		seen.add(t.id);
		text(t.name, t.id);
		for (const lang of ['en', 'ua']) {
			const key = t.name[lang].toLocaleLowerCase();
			assert(!names[lang].has(key), `${t.id}: duplicate ${lang} name`);
			names[lang].add(key);
			assert(Array.isArray(t.aliases[lang]), `${t.id}: ${lang} aliases`);
		}
		const pos = subIndex.get(t.subcategoryId);
		assert(pos, `${t.id}: unknown subcategory`);
		assert.equal(categories[pos[0]].id, t.categoryId, `${t.id}: subcategory belongs to another category`);
		const flagged = safety.groups.flatMap((g, i) => (g.techniqueIds.includes(t.id) ? [i] : []));
		return [t.id, t.name.en, t.name.ua, t.aliases.en, t.aliases.ua, pos[0], pos[1], flagged, links[t.id] ?? []];
	});
	assert.equal(items.length, info.techniqueCount, 'technique count matches the archive');
	assert.equal(categories.length, info.categoryCount, 'category count matches the archive');
	assert.equal(subIndex.size, info.subcategoryCount, 'subcategory count matches the archive');

	// theory id to the techniques it explains: [id, English, Ukrainian]
	const byTheory = {};
	for (const [id, en, ua, , , , , , theories] of items) {
		for (const theory of theories) (byTheory[theory] ??= []).push([id, en, ua]);
	}
	return {
		techniques: JSON.stringify({ categories, safety: flags, items }),
		theoryTechniques: JSON.stringify(byTheory),
	};
}

export const OUTPUTS = {
	techniques: 'src/data/cooking/techniques.json',
	theoryTechniques: 'src/data/cooking/theory-techniques.json',
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const built = build();
	for (const [key, file] of Object.entries(OUTPUTS)) fs.writeFileSync(path.join(root, file), built[key]);
	const data = JSON.parse(built.techniques);
	console.log(`Imported ${data.items.length} techniques in ${data.categories.length} categories.`);
}
