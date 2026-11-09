import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { applyTextFixes } from './text-fixes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => {
	fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
	fs.writeFileSync(path.join(root, file), value);
};
const json = (file, data) => write(file, JSON.stringify(data, null, 2) + '\n');
const manifest = JSON.parse(read('content/cooking-import.json'));
// Originals stay untouched; dead source links are replaced here (see content/reference-fixes.json).
// Revised lessons no longer list related theories, so their links are kept here (content/related-theories.json).
const relatedLinks = JSON.parse(read('content/related-theories.json'));
const referenceFixes = JSON.parse(read('content/reference-fixes.json'));
const ranges = [
	[1, 11, 'Foundations', 'Основи'],
	[12, 30, 'Food safety', 'Безпека харчових продуктів'],
	[31, 42, 'Knife skills and preparation', 'Ніж і підготовка продуктів'],
	[43, 56, 'Heat and food chemistry', 'Тепло й хімія приготування'],
	[57, 69, 'Flavor and seasoning', 'Смак, аромат і приправляння'],
	[70, 91, 'Cooking methods', 'Способи приготування'],
	[92, 104, 'Vegetables and fruit', 'Овочі та фрукти'],
	[105, 116, 'Starch, grains and legumes', 'Крохмаль, зернові та бобові'],
	[117, 128, 'Eggs, dairy and fats', 'Яйця, молочні продукти та жири'],
	[129, 142, 'Meat and poultry', 'М’ясо та птиця'],
	[143, 153, 'Fish and seafood', 'Риба та морепродукти'],
	[154, 160, 'Salads and cold dishes', 'Салати та холодні страви'],
	[161, 177, 'Stocks, soups and sauces', 'Бульйони, супи та соуси'],
	[178, 190, 'Dough and bread', 'Тісто та хліб'],
	[191, 206, 'Baking and desserts', 'Випічка та десерти'],
	[207, 216, 'Fermentation', 'Ферментація'],
	[217, 226, 'Preservation and storage', 'Консервування та зберігання'],
	[227, 239, 'Nutrition', 'Харчування'],
	[240, 255, 'World cuisines', 'Кухні світу'],
	[256, 261, 'Culinary science', 'Кулінарна наука'],
	[262, 276, 'Recipe development', 'Розробка рецептів'],
	[277, 288, 'Kitchen operations', 'Організація роботи кухні'],
];
export const groups = ranges.map(([from, to, en, ua]) => ({
	id: String(from).padStart(3, '0'),
	from,
	to,
	title: { en, ua },
}));
const slugify = (text) =>
	text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[’']/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

export function parseTheory(file) {
	const raw = fs.readFileSync(path.join(root, 'content/cooking-theories', file.file));
	assert.equal(
		createHash('sha256').update(raw).digest('hex'),
		file.sha256,
		`Changed original ${file.file}`,
	);
	const source = applyTextFixes(
		file.file,
		raw
			.toString('utf8')
			.replace(/^\uFEFF/, '')
			.replace(/\r\n/g, '\n'),
	);
	const title = source.match(/^## (\d{3})\. (.+?) \/ (.+)$/m);
	assert(title, `Title: ${file.file}`);
	assert.equal(Number(title[1]), file.id);
	const headings = [...source.matchAll(/^### (.+)\n/gm)];
	assert.equal(headings.length, 5, `Sections: ${file.file}`);
	assert.deepEqual(
		headings.slice(0, 4).map((h) => h[1]),
		['EN — Short', 'EN — Detailed', 'UA — Коротко', 'UA — Детально'],
	);
	const text = (index) =>
		source
			.slice(
				headings[index].index + headings[index][0].length,
				headings[index + 1]?.index ?? source.length,
			)
			.trim();
	const parts = (index) => {
		const body = text(index),
			// a few revised lessons write the colon outside the bold title: "- **Title**: text"
			marks = [...body.matchAll(/^- \*\*(.+?)(?::\*\*|\*\*:)\s*/gm)];
		assert(marks.length >= 5 && marks.length <= 9, `Detailed parts: ${file.file}`);
		return marks.map((m, i) => ({
			title: m[1],
			text: body.slice(m.index + m[0].length, marks[i + 1]?.index ?? body.length).trim(),
		}));
	};
	const en = { short: text(0), sections: parts(1) },
		ua = { short: text(2), sections: parts(3) };
	assert.equal(en.sections.length, ua.sections.length, `Section count: ${file.file}`);
	// related theories sit in a section of their own, anywhere in the list; revised lessons may leave it out
	const relatedSection = (language, title) => language.sections.find((s) => s.title === title);
	const numbers = (section) => [...new Set(section.text.match(/\b\d{3}\b/g)?.map(Number) ?? [])];
	const enRelated = relatedSection(en, 'Related theories');
	const uaRelated = relatedSection(ua, 'Пов’язані теорії');
	let related;
	if (enRelated && uaRelated) {
		assert.deepEqual(
			numbers(enRelated).sort((a, b) => a - b),
			numbers(uaRelated).sort((a, b) => a - b),
			`Related language mismatch: ${file.file}`,
		);
		related = numbers(enRelated);
	} else {
		assert(!enRelated && !uaRelated, `Related in one language only: ${file.file}`);
		related = relatedLinks[String(file.id).padStart(3, '0')];
		assert(Array.isArray(related), `Related links missing: ${file.file}`);
	}
	assert(
		related.every((id) => id >= 1 && id <= manifest.files.length),
		`Related range: ${file.file}`,
	);
	const references = text(4)
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => line.replace(/^- /, ''))
		.map((url) => referenceFixes[url] ?? url);
	assert(
		references.length > 0 && references.every((url) => /^https:\/\/[^\s]+$/.test(url)),
		`Sources: ${file.file}`,
	);
	const group = groups.find((g) => file.id >= g.from && file.id <= g.to);
	assert(group);
	return {
		id: file.id,
		slug: `${title[1]}-${slugify(title[2])}`,
		group: group.id,
		title: { en: title[2], ua: title[3] },
		en,
		ua,
		related,
		referenceTitle: headings[4][1],
		references,
	};
}

export const theories = manifest.files.map(parseTheory).sort((a, b) => a.id - b.id);
assert.deepEqual(
	theories.map((t) => t.id),
	Array.from({ length: manifest.files.length }, (_, i) => i + 1),
);
assert.equal(new Set(theories.map((t) => t.slug)).size, manifest.files.length);
const catalog = theories.map(({ id, slug, group, title, en, ua }) => ({
	id,
	slug,
	group,
	title,
	summary: { en: en.short, ua: ua.short },
}));
json('src/data/cooking/catalog.json', { groups, theories: catalog });
json(
	'src/data/cooking/routes.json',
	theories.map(({ slug }) => ({ slug })),
);
for (const theory of theories)
	json(`src/data/cooking/lessons/${String(theory.id).padStart(3, '0')}.json`, theory);
write(
	'src/app/feature/cooking/theory.loaders.ts',
	`// Generated from the original Cooking Markdown. One lazy chunk per lesson.\nexport const COOKING_LOADERS: Record<string, () => Promise<{default: unknown}>> = {\n${theories.map((t) => ` '${t.slug}': () => import('../../../data/cooking/lessons/${String(t.id).padStart(3, '0')}.json'),`).join('\n')}\n};\n`,
);
const company = JSON.parse(read('src/data/company/company.json'));
for (const key of Object.keys(company.pageSeo))
	if (key.startsWith('/theories/')) delete company.pageSeo[key];
company.description =
	`Learn cooking through ${manifest.files.length} English and Ukrainian theories: short explanations, detailed principles, practical examples and linked sources.`;
company.defaultSeo.description = company.description;
company.pageSeo['/'].description = company.description;
company.pageSeo['/theories'] = {
	title: 'Cooking theories',
	description:
		`Browse and search ${manifest.files.length} bilingual cooking theories in ${groups.length} topics. Read short and detailed versions, follow related lessons and print your study material.`,
	image: '/seo/cooking.jpg',
};
json(
	'src/data/cooking/seo.json',
	Object.fromEntries(
		theories.map((theory) => [
			'/theories/' + theory.slug,
			{ title: theory.title.en, description: theory.en.short, image: '/seo/cooking.jpg' },
		]),
	),
);
json('src/data/company/company.json', company);
console.log(
	`Imported ${theories.length} Cooking theories, ${theories.length * 2} language versions, ${groups.length} groups and original source links.`,
);
