import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { applyTextFixes } from './text-fixes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('content/cooking-import.json'));
const catalog = JSON.parse(read('src/data/cooking/catalog.json'));
const referenceFixes = JSON.parse(read('content/reference-fixes.json'));
const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const clean = (text) => normalize(text.replace(/\*\*/g, ''));
const plainHtml = (html) =>
	normalize(
		html
			.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<[^>]+>/g, '')
			.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
			.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
			.replace(/&quot;/g, '"')
			.replace(/&#39;|&apos;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&'),
	);
const total = manifest.files.length;
assert.equal(manifest.count, total);
assert.deepEqual(
	catalog.theories.map((t) => t.id),
	Array.from({ length: total }, (_, i) => i + 1),
);
assert.equal(catalog.groups.length, 22);
assert.equal(catalog.groups[0].from, 1);
assert.equal(catalog.groups.at(-1).to, total);
catalog.groups.forEach((g, i) => i && assert.equal(g.from, catalog.groups[i - 1].to + 1));
let detailedParts = 0;
for (const card of catalog.theories) {
	const provenance = manifest.files.find((f) => f.id === card.id);
	const raw = fs.readFileSync(path.join(root, 'content/cooking-theories', provenance.file));
	assert.equal(
		createHash('sha256').update(raw).digest('hex'),
		provenance.sha256,
		`Original changed: ${provenance.file}`,
	);
	const source = applyTextFixes(
		provenance.file,
		raw
			.toString('utf8')
			.replace(/^\uFEFF/, '')
			.replace(/\r\n/g, '\n'),
	);
	const lesson = JSON.parse(
		read(`src/data/cooking/lessons/${String(card.id).padStart(3, '0')}.json`),
	);
	assert.equal(lesson.slug, card.slug);
	assert.deepEqual(lesson.title, card.title);
	const sourceParts = source
		.split(/^### .+\n/gm)
		.slice(1)
		.map((p) => p.trim());
	assert.equal(sourceParts.length, 5);
	for (const [language, shortIndex, detailIndex] of [
		['en', 0, 1],
		['ua', 2, 3],
	]) {
		const body = lesson[language];
		assert.equal(body.short, sourceParts[shortIndex]);
		assert.equal(
			body.sections.length,
			[...sourceParts[detailIndex].matchAll(/^- \*\*.+?(?::\*\*|\*\*:)/gm)].length,
			`Section count: ${card.id} ${language}`,
		);
		assert(body.sections.length >= 5 && body.sections.length <= 9);
		assert.equal(
			normalize(body.sections.map((s) => `- **${s.title}:** ${s.text}`).join('\n')),
			normalize(sourceParts[detailIndex].replace(/^- \*\*(.+?)\*\*:/gm, '- **$1:**')),
			`Missing or altered detailed text: ${card.id} ${language}`,
		);
		assert.equal(card.summary[language], body.short);
		detailedParts += body.sections.length;
	}
	assert.deepEqual(
		lesson.references,
		sourceParts[4]
			.split('\n')
			.map((p) => p.trim())
			.filter(Boolean)
			.map((p) => p.replace(/^- /, ''))
			.map((url) => referenceFixes[url] ?? url),
	);
	assert(lesson.related.every((id) => Number.isInteger(id) && id >= 1 && id <= total));
	const group = catalog.groups.find((g) => g.id === card.group);
	assert(group && card.id >= group.from && card.id <= group.to);
	if (process.argv.includes('--built')) {
		const html = read(`dist/app/browser/theories/${card.slug}/index.html`),
			text = plainHtml(html);
		assert(text.includes(clean(lesson.title.en)), `Rendered title missing: ${card.id}`);
		const metaDescription=html.match(/<meta name="description" content="([^"]*)"/);
		assert(metaDescription,`Description metadata missing: ${card.id}`);
		assert.equal(clean(plainHtml(metaDescription[1])),clean(lesson.en.short),`Description metadata changed: ${card.id}`);
		assert(plainHtml(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '').includes(lesson.title.en),`Lesson title metadata missing: ${card.id}`);
		for (const part of lesson.en.sections.filter((s) => s.title !== 'Related theories')) {
			assert(text.includes(clean(part.title)), `Rendered section title missing: ${card.id}`);
			assert(
				text.includes(clean(part.text)),
				`Rendered detailed content missing: ${card.id}: ${part.title}`,
			);
		}
		assert(
			html.includes(`https://cooking.webart.work/theories/${card.slug}`),
			`Canonical missing: ${card.id}`,
		);
		assert(html.includes('/seo/cooking.jpg'), `Generic cover missing: ${card.id}`);
		for (const url of lesson.references)
			assert(
				html.includes(url.replaceAll('&', '&amp;')) || html.includes(url),
				`Source link missing: ${card.id}`,
			);
	}
}
console.log(
	`Verified ${total} unchanged originals, ${total * 2} language versions, ${detailedParts} detailed sections, source links and ${catalog.groups.length} topic groups${process.argv.includes('--built') ? `, plus all ${total} prerendered lessons` : ''}.`,
);
