import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pad = (n) => String(n).padStart(3, '0');
const TYPES = [
	'single_choice',
	'multiple_choice',
	'true_false',
	'sequence',
	'matching',
	'calculation',
	'find_mistake',
	'decision_scenario',
];

const text = (value, where) => {
	assert(value && typeof value.en === 'string' && value.en.trim(), `${where}: English text missing`);
	assert(typeof value.ua === 'string' && value.ua.trim(), `${where}: Ukrainian text missing`);
};

/** Checks one exercise: both languages everywhere, and an answer that points at things that exist. */
function validate(exercise, theoryId) {
	const where = exercise.id;
	assert(exercise.theoryId === theoryId, `${where}: theoryId`);
	assert(new RegExp(`^cooking-${pad(theoryId)}-\\d{2}$`).test(exercise.id), `${where}: id format`);
	assert(TYPES.includes(exercise.type), `${where}: unknown type ${exercise.type}`);
	assert(['beginner', 'intermediate', 'advanced'].includes(exercise.difficulty), `${where}: difficulty`);
	assert(typeof exercise.safetyCritical === 'boolean', `${where}: safetyCritical`);
	text(exercise.question, `${where} question`);
	text(exercise.explanation, `${where} explanation`);
	const ids = (items) => new Set(items.map((item) => item.id));
	switch (exercise.type) {
		case 'single_choice':
		case 'find_mistake':
		case 'decision_scenario':
		case 'multiple_choice': {
			assert(exercise.options.length >= 2, `${where}: options`);
			exercise.options.forEach((o) => text(o.text, `${where} option ${o.id}`));
			const known = ids(exercise.options);
			assert.equal(known.size, exercise.options.length, `${where}: duplicate option ids`);
			const answer = exercise.answer.optionIds;
			assert(answer.length >= 1 && answer.every((id) => known.has(id)), `${where}: answer options`);
			assert.equal(new Set(answer).size, answer.length, `${where}: duplicate answers`);
			if (exercise.type !== 'multiple_choice') assert.equal(answer.length, 1, `${where}: one answer`);
			break;
		}
		case 'true_false':
			assert.equal(typeof exercise.answer.value, 'boolean', `${where}: answer`);
			break;
		case 'sequence': {
			exercise.steps.forEach((s) => text(s.text, `${where} step ${s.id}`));
			const known = ids(exercise.steps);
			assert(exercise.steps.length >= 2 && known.size === exercise.steps.length, `${where}: steps`);
			const order = exercise.answer.order;
			assert.equal(order.length, known.size, `${where}: order length`);
			assert(order.every((id) => known.has(id)) && new Set(order).size === order.length, `${where}: order`);
			break;
		}
		case 'matching': {
			[...exercise.leftItems, ...exercise.rightItems].forEach((s) => text(s.text, `${where} item ${s.id}`));
			const left = ids(exercise.leftItems);
			const right = ids(exercise.rightItems);
			const pairs = exercise.answer.pairs;
			assert.equal(pairs.length, left.size, `${where}: every left item needs a pair`);
			assert(pairs.every((p) => left.has(p.leftId) && right.has(p.rightId)), `${where}: pair ids`);
			assert.equal(new Set(pairs.map((p) => p.leftId)).size, left.size, `${where}: left used twice`);
			assert.equal(new Set(pairs.map((p) => p.rightId)).size, pairs.length, `${where}: right used twice`);
			break;
		}
		case 'calculation': {
			const { value, tolerance, unit } = exercise.answer;
			assert(Number.isFinite(value) && Number.isFinite(tolerance) && tolerance >= 0, `${where}: numbers`);
			assert(typeof unit === 'string', `${where}: unit`);
			text(exercise.numericInput.unitLabel, `${where} unit label`);
			assert.equal(typeof exercise.numericInput.allowDecimals, 'boolean', `${where}: allowDecimals`);
			break;
		}
	}
}

/** What the app loads for one theory: the exercises only, written compactly. */
export function transform(file, manifest) {
	const raw = fs.readFileSync(path.join(root, 'content/cooking-exercises', file.file));
	assert.equal(createHash('sha256').update(raw).digest('hex'), file.sha256, `Changed original ${file.file}`);
	const source = JSON.parse(raw.toString('utf8').replace(/^﻿/, ''));
	assert.equal(source.theory.id, file.id, `${file.file}: theory id`);
	assert(source.exercises.length >= 1, `${file.file}: no exercises`);
	source.exercises.forEach((exercise) => validate(exercise, file.id));
	assert.equal(new Set(source.exercises.map((e) => e.id)).size, source.exercises.length, `${file.file}: duplicate ids`);
	const catalog = JSON.parse(read('src/data/cooking/catalog.json'));
	assert(catalog.theories.some((t) => t.id === file.id), `${file.file}: theory ${file.id} is not in the catalog`);
	return { theoryId: file.id, exercises: source.exercises };
}

export function build() {
	const manifest = JSON.parse(read('content/cooking-exercises-import.json'));
	const catalog = JSON.parse(read('src/data/cooking/catalog.json'));
	const slugs = Object.fromEntries(catalog.theories.map((t) => [t.id, t.slug]));
	assert.equal(manifest.count, manifest.files.length);
	assert.equal(manifest.files.length, catalog.theories.length, 'one exercise file per theory');
	const lessons = manifest.files.map((file) => ({ file, data: transform(file, manifest) }));
	const index = lessons.map(({ data }) => ({
		id: data.theoryId,
		slug: slugs[data.theoryId],
		count: data.exercises.length,
		safety: data.exercises.filter((e) => e.safetyCritical).length,
	}));
	const allIds = lessons.flatMap(({ data }) => data.exercises.map((e) => e.id));
	assert.equal(new Set(allIds).size, allIds.length, 'exercise ids are unique across theories');
	return { manifest, lessons, index, slugs };
}

const outputs = ({ lessons, index, slugs }) => {
	const files = new Map();
	for (const { data } of lessons) files.set(`src/data/cooking/exercises/${pad(data.theoryId)}.json`, JSON.stringify(data));
	files.set('src/data/cooking/exercise-index.json', JSON.stringify(index));
	files.set(
		'src/app/feature/cooking/exercise.loaders.ts',
		`// Generated from content/cooking-exercises by tools/practice/import-exercises.mjs. One lazy chunk per theory.\nexport const EXERCISE_LOADERS: Record<string, () => Promise<{default: unknown}>> = {\n${lessons.map(({ data }) => `\t'${slugs[data.theoryId]}': () => import('../../../data/cooking/exercises/${pad(data.theoryId)}.json'),`).join('\n')}\n};\n`,
	);
	return files;
};

/** The generated files, as they should be on disk. */
export const expectedOutputs = () => outputs(build());

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const built = build();
	fs.mkdirSync(path.join(root, 'src/data/cooking/exercises'), { recursive: true });
	for (const [file, contents] of outputs(built)) fs.writeFileSync(path.join(root, file), contents);
	const total = built.index.reduce((sum, t) => sum + t.count, 0);
	console.log(`Imported ${total} exercises for ${built.index.length} theories.`);
}
