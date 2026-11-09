import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = 'content/cooking-ingredients/';
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/cooking-ingredients-import.json'), 'utf8'));

const read = (name) => {
	const raw = fs.readFileSync(path.join(root, dir, name));
	assert.equal(createHash('sha256').update(raw).digest('hex'), manifest.files[name], `Changed original ${name}`);
	return JSON.parse(raw.toString('utf8').replace(/^﻿/, ''));
};

const text = (value, where) => {
	assert(value && typeof value.en === 'string' && value.en.trim(), `${where}: English missing`);
	assert(typeof value.ua === 'string' && value.ua.trim(), `${where}: Ukrainian missing`);
};
const norm = (s) => s.toLocaleLowerCase().replace(/[’'ʼ`]/g, '').replace(/\s+/g, ' ').trim();

/** The data the app loads: categories once, and each ingredient as a short array. */
export function build() {
	const source = read('ingredients.json');
	const taxonomy = read('taxonomy.json');
	const info = read('manifest.json');

	const categories = taxonomy.categories.map((c) => {
		text(c.name, `category ${c.id}`);
		c.subcategories.forEach((s) => text(s.name, `subcategory ${s.id}`));
		return { id: c.id, name: c.name, subs: c.subcategories.map((s) => ({ id: s.id, name: s.name })) };
	});
	const categoryIndex = new Map(categories.map((c, i) => [c.id, i]));
	assert.equal(categoryIndex.size, categories.length, 'duplicate category ids');
	const subIndex = new Map(categories.flatMap((c, ci) => c.subs.map((s, si) => [s.id, [ci, si]])));
	assert.equal(subIndex.size, categories.reduce((n, c) => n + c.subs.length, 0), 'duplicate subcategory ids');

	const seenIds = new Set();
	const seenNames = { en: new Set(), ua: new Set() };
	const items = source.ingredients.map((item) => {
		assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id), `${item.id}: id format`);
		assert(!seenIds.has(item.id), `${item.id}: duplicate id`);
		seenIds.add(item.id);
		text(item.name, item.id);
		for (const lang of ['en', 'ua']) {
			const key = norm(item.name[lang]);
			assert(!seenNames[lang].has(key), `${item.id}: duplicate ${lang} name ${item.name[lang]}`);
			seenNames[lang].add(key);
			assert(Array.isArray(item.aliases[lang]), `${item.id}: ${lang} aliases`);
			assert.equal(new Set(item.aliases[lang]).size, item.aliases[lang].length, `${item.id}: repeated ${lang} alias`);
		}
		const pos = subIndex.get(item.subcategoryId);
		assert(pos, `${item.id}: unknown subcategory ${item.subcategoryId}`);
		assert.equal(categories[pos[0]].id, item.categoryId, `${item.id}: subcategory belongs to another category`);
		return [item.id, item.name.en, item.name.ua, item.aliases.en, item.aliases.ua, pos[0], pos[1]];
	});

	assert.equal(items.length, info.ingredientCount, 'ingredient count matches the archive');
	assert.equal(categories.length, info.categoryCount, 'category count matches the archive');
	assert.equal(subIndex.size, info.subcategoryCount, 'subcategory count matches the archive');
	// the units a recipe can use for an amount: [id, English, Ukrainian, type]
	const units = read('units.json').units.map((u) => {
		text(u.name, `unit ${u.id}`);
		return [u.id, u.name.en, u.name.ua, u.type];
	});
	assert.equal(new Set(units.map((u) => u[0])).size, units.length, 'duplicate unit ids');
	return JSON.stringify({ categories, items, units });
}

export const OUTPUT = 'src/data/cooking/ingredients.json';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const out = build();
	fs.writeFileSync(path.join(root, OUTPUT), out);
	const data = JSON.parse(out);
	console.log(`Imported ${data.items.length} ingredients in ${data.categories.length} categories.`);
}
