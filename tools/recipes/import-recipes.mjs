import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file).replace(/^﻿/, ''));
const provenance = json('content/world-recipes-import.json');

/** The supplied text uses em dashes; the site does not. They become commas, or hyphens inside a word. */
const plain = (text) => text.replace(/\s+—\s+/g, ', ').replace(/—/g, '-');

const slugOf = (title, number) =>
	number +
	'-' +
	title
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 60)
		.replace(/-$/, '');

/** Region ids and the countries of each, read from the app's own list so the two never disagree. */
function appRegions() {
	const source = read('src/app/pages/cook/geography.data.ts');
	const owner = new Map();
	for (const m of source.matchAll(/\{ id: '([a-z-]+)', name: [^]*?countries: \[([^\]]*)\] \}/g))
		for (const c of m[2].matchAll(/'([A-Z]{2})'/g)) {
			assert(!owner.has(c[1]), `${c[1]} is in two regions`);
			owner.set(c[1], m[1]);
		}
	return owner;
}

const names = (items) => new Set(items.map((item) => (Array.isArray(item) ? item[0] : item.id)));

/**
 * What the app loads. The index is small (it drives the list, search and filters); each recipe is its own
 * lazy file with both languages. The supplied files stay untouched on disk (their hashes are checked); the
 * region comes from the country, using the app's regions.
 */
export function build() {
	const ingredients = json('src/data/cooking/ingredients.json');
	const techniques = json('src/data/cooking/techniques.json');
	const ingredientIds = names(ingredients.items);
	const techniqueIds = names(techniques.items);
	const unitIds = names(ingredients.units);
	const owner = appRegions();

	const recipes = [];
	const slugs = new Set();
	for (const archive of provenance.archives) {
		const dir = `content/world-recipes/${archive.range}`;
		const listed = fs.readdirSync(path.join(root, dir, 'en')).filter((name) => name.endsWith('.json')).sort();
		assert.equal(listed.length, archive.recipes, `${archive.range}: recipe count matches the archive`);
		for (const file of listed) {
			const both = {};
			for (const lang of ['en', 'ua']) {
				const key = `${archive.range}/${lang}/${file}`;
				const raw = fs.readFileSync(path.join(root, 'content/world-recipes', key));
				assert.equal(createHash('sha256').update(raw).digest('hex'), provenance.files[key], `Changed original ${key}`);
				both[lang] = JSON.parse(raw.toString('utf8').replace(/^﻿/, ''));
			}
			const { en, ua } = both;
			const where = en.id;
			assert.match(en.id, /^world-\d{4}$/, `${where}: id`);
			assert.equal(ua.id, en.id, `${where}: Ukrainian id`);
			assert.equal(Number(file.replace('.json', '')), Number(en.id.slice(6)), `${where}: file name`);
			assert(en.title.trim() && ua.title.trim(), `${where}: title in both languages`);
			assert(en.description.trim() && ua.description.trim(), `${where}: description in both languages`);
			assert.equal(ua.countryCode, en.countryCode, `${where}: country`);
			assert.equal(ua.servings, en.servings, `${where}: servings`);
			assert(Number.isInteger(en.servings) && en.servings > 0, `${where}: servings`);
			assert(owner.has(en.countryCode), `${where}: country ${en.countryCode} is in no region of the app`);
			assert.equal(ua.steps.length, en.steps.length, `${where}: steps`);
			assert(en.steps.length > 0, `${where}: has steps`);

			let minutes = 0;
			const used = new Set();
			const steps = en.steps.map((step, i) => {
				const other = ua.steps[i];
				assert.equal(other.id, step.id, `${where} step ${i + 1}: id`);
				assert(step.instruction.trim() && other.instruction.trim(), `${where} step ${i + 1}: instruction in both languages`);
				assert.deepEqual(other.techniqueIds, step.techniqueIds, `${where} step ${i + 1}: techniques`);
				assert.equal(other.durationMinutes, step.durationMinutes, `${where} step ${i + 1}: time`);
				assert.deepEqual(other.ingredients, step.ingredients, `${where} step ${i + 1}: ingredients`);
				step.techniqueIds.forEach((id) => assert(techniqueIds.has(id), `${where}: unknown technique ${id}`));
				if (step.durationMinutes) minutes += step.durationMinutes;
				const items = step.ingredients.map((item) => {
					assert(ingredientIds.has(item.ingredientId), `${where}: unknown ingredient ${item.ingredientId}`);
					assert(unitIds.has(item.unit), `${where}: unknown unit ${item.unit}`);
					assert(item.amount === null || typeof item.amount === 'number', `${where}: amount`);
					used.add(item.ingredientId);
					return [item.ingredientId, item.amount, item.unit];
				});
				return { en: plain(step.instruction), ua: plain(other.instruction), t: step.techniqueIds, m: step.durationMinutes, i: items };
			});
			assert(used.size > 0, `${where}: uses ingredients`);

			const number = en.id.slice(6);
			const slug = slugOf(en.title, number);
			assert(!slugs.has(slug), `${where}: duplicate slug ${slug}`);
			slugs.add(slug);
			recipes.push({
				slug,
				id: en.id,
				country: en.countryCode,
				region: owner.get(en.countryCode),
				servings: en.servings,
				minutes,
				titleEn: plain(en.title),
				titleUa: plain(ua.title),
				descEn: plain(en.description),
				descUa: plain(ua.description),
				steps,
				ingredientCount: used.size,
			});
		}
	}
	assert.equal(recipes.length, provenance.recipes, 'total recipes match the provenance file');
	assert(!recipes.some((r) => JSON.stringify(r).includes('—')), 'no em dash is left');

	const index = {
		items: recipes.map((r) => [r.slug, r.titleEn, r.titleUa, r.country, r.region, r.servings, r.minutes, r.ingredientCount]),
	};
	const files = {};
	for (const r of recipes) {
		files[`src/data/cooking/recipes/${r.slug}.json`] =
			JSON.stringify({ slug: r.slug, id: r.id, country: r.country, region: r.region, servings: r.servings, minutes: r.minutes, title: { en: r.titleEn, ua: r.titleUa }, text: { en: r.descEn, ua: r.descUa }, steps: r.steps }) + '\n';
	}
	const loaders =
		"// Generated by tools/recipes/import-recipes.mjs: one lazy chunk per recipe.\nexport const RECIPE_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {\n" +
		recipes.map((r) => `\t'${r.slug}': () => import('../../../data/cooking/recipes/${r.slug}.json'),`).join('\n') +
		'\n};\n';
	return { index: JSON.stringify(index), files, loaders, count: recipes.length };
}

export const INDEX_FILE = 'src/data/cooking/recipes-index.json';
export const LOADERS_FILE = 'src/app/feature/cooking/recipe.loaders.ts';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const built = build();
	fs.rmSync(path.join(root, 'src/data/cooking/recipes'), { recursive: true, force: true });
	fs.mkdirSync(path.join(root, 'src/data/cooking/recipes'), { recursive: true });
	fs.writeFileSync(path.join(root, INDEX_FILE), built.index);
	fs.writeFileSync(path.join(root, LOADERS_FILE), built.loaders);
	for (const [file, text] of Object.entries(built.files)) fs.writeFileSync(path.join(root, file), text);
	console.log(`Imported ${built.count} recipes.`);
}
