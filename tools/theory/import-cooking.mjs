import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => {
	fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
	fs.writeFileSync(path.join(root, file), value);
};
const json = (file, data) => write(file, JSON.stringify(data, null, 2) + '\n');
const manifest = JSON.parse(read('content/cooking-import.json'));
const ranges = [
	[1, 15, 'Foundations', 'Основи'],
	[16, 30, 'Food safety', 'Безпека харчових продуктів'],
	[31, 45, 'Preparation and knife skills', 'Підготовка та робота з ножем'],
	[46, 65, 'Heat and temperature', 'Тепло й температура'],
	[66, 90, 'Cooking methods', 'Способи приготування'],
	[91, 105, 'Taste and aroma', 'Смак та аромат'],
	[106, 120, 'Vegetables and fruit', 'Овочі та фрукти'],
	[121, 135, 'Starch, grains and legumes', 'Крохмаль, зернові та бобові'],
	[136, 150, 'Eggs and dairy', 'Яйця та молочні продукти'],
	[151, 165, 'Meat and poultry', 'М’ясо та птиця'],
	[166, 180, 'Fish and seafood', 'Риба та морепродукти'],
	[181, 195, 'Stocks and sauces', 'Бульйони та соуси'],
	[196, 210, 'Dough and bread', 'Тісто та хліб'],
	[211, 225, 'Baking and desserts', 'Випічка та десерти'],
	[226, 240, 'Fermentation', 'Ферментація'],
	[241, 255, 'Preservation and storage', 'Консервування та зберігання'],
	[256, 270, 'Nutrition', 'Харчування'],
	[271, 285, 'World cuisines', 'Кухні світу'],
	[286, 300, 'Culinary science', 'Кулінарна наука'],
	[301, 315, 'Recipe development', 'Розробка рецептів'],
	[316, 330, 'Kitchen operations', 'Організація роботи кухні'],
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
	const source = raw
		.toString('utf8')
		.replace(/^\uFEFF/, '')
		.replace(/\r\n/g, '\n');
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
			marks = [...body.matchAll(/^- \*\*(.+?):\*\*\s*/gm)];
		assert.equal(marks.length, 6, `Detailed parts: ${file.file}`);
		return marks.map((m, i) => ({
			title: m[1],
			text: body.slice(m.index + m[0].length, marks[i + 1]?.index ?? body.length).trim(),
		}));
	};
	const en = { short: text(0), sections: parts(1) },
		ua = { short: text(2), sections: parts(3) };
	const numbers = (language) => [
		...new Set(
			language.sections
				.at(-1)
				.text.match(/\b\d{3}\b/g)
				?.map(Number) ?? [],
		),
	];
	assert.deepEqual(
		numbers(en).sort((a, b) => a - b),
		numbers(ua).sort((a, b) => a - b),
		`Related language mismatch: ${file.file}`,
	);
	const related = numbers(en);
	assert(
		related.every((id) => id >= 1 && id <= 330),
		`Related range: ${file.file}`,
	);
	const references = text(4)
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => line.replace(/^- /, ''));
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
	Array.from({ length: 330 }, (_, i) => i + 1),
);
assert.equal(new Set(theories.map((t) => t.slug)).size, 330);
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
	'Learn cooking through 330 English and Ukrainian theories: short explanations, detailed principles, practical examples and linked sources.';
company.defaultSeo.description = company.description;
company.pageSeo['/'].description = company.description;
company.pageSeo['/theories'] = {
	title: 'Cooking theories',
	description:
		'Browse and search 330 bilingual cooking theories in 21 topics. Read short and detailed versions, follow related lessons and print your study material.',
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
	'Imported 330 Cooking theories, 660 language versions, 21 groups and original source links.',
);
