import type { Localized } from './theories';

export type ExerciseType =
	| 'single_choice'
	| 'multiple_choice'
	| 'true_false'
	| 'sequence'
	| 'matching'
	| 'calculation'
	| 'find_mistake'
	| 'decision_scenario';

export interface Choice {
	id: string;
	text: Localized;
}

/** One exercise as it is in the data. Which fields are present depends on the type (checked at import). */
export interface Exercise {
	id: string;
	theoryId: number;
	type: ExerciseType;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	safetyCritical: boolean;
	question: Localized;
	explanation: Localized;
	options?: Choice[];
	steps?: Choice[];
	leftItems?: Choice[];
	rightItems?: Choice[];
	numericInput?: { unit: string; allowDecimals: boolean; unitLabel: Localized };
	answer: {
		optionIds?: string[];
		value?: boolean | number;
		order?: string[];
		pairs?: { leftId: string; rightId: string }[];
		tolerance?: number;
		unit?: string;
	};
}

export interface ExerciseSet {
	theoryId: number;
	exercises: Exercise[];
}

/** What the learner has entered; the shape depends on the exercise type. */
export interface Answer {
	/** single_choice, find_mistake, decision_scenario, multiple_choice */
	picked: string[];
	/** true_false */
	flag: boolean | null;
	/** sequence: the step ids in the learner's order */
	order: string[];
	/** matching: left id to right id */
	pairs: Record<string, string>;
	/** calculation: the text typed in */
	number: string;
}

export const emptyAnswer = (): Answer => ({ picked: [], flag: null, order: [], pairs: {}, number: '' });

/** Reads a typed number; a comma counts as the decimal separator. Returns null when it is not a number. */
export function parseNumber(text: string): number | null {
	const cleaned = text.trim().replace(/\s/g, '').replace(',', '.');
	if (!/^[-+]?\d+(\.\d+)?$/.test(cleaned)) return null;
	return Number(cleaned);
}

/** Whether the answer is complete enough to be checked. */
export function isComplete(exercise: Exercise, answer: Answer): boolean {
	switch (exercise.type) {
		case 'true_false':
			return answer.flag !== null;
		case 'sequence':
			return true;
		case 'matching':
			return Object.keys(answer.pairs).length === (exercise.leftItems?.length ?? 0);
		case 'calculation':
			return parseNumber(answer.number) !== null;
		default:
			return answer.picked.length > 0;
	}
}

/** Grades an answer. Choices must match exactly: there is no partial credit. */
export function grade(exercise: Exercise, answer: Answer): boolean {
	const key = exercise.answer;
	switch (exercise.type) {
		case 'true_false':
			return answer.flag === key.value;
		case 'sequence':
			return (key.order ?? []).every((id, i) => answer.order[i] === id) && answer.order.length === key.order?.length;
		case 'matching':
			return (key.pairs ?? []).every((pair) => answer.pairs[pair.leftId] === pair.rightId);
		case 'calculation': {
			const value = parseNumber(answer.number);
			// a small allowance keeps floating point noise from failing an exact answer
			return value !== null && Math.abs(value - Number(key.value)) <= (key.tolerance ?? 0) + 1e-9;
		}
		default: {
			const wanted = [...(key.optionIds ?? [])].sort();
			const given = [...answer.picked].sort();
			return wanted.length === given.length && wanted.every((id, i) => id === given[i]);
		}
	}
}

/** A shuffle that gives the same order for the same seed, so a page looks the same when it is shown again. */
export function shuffled<T>(items: readonly T[], seed: string): T[] {
	let h = 1779033703 ^ seed.length;
	for (let i = 0; i < seed.length; i++) {
		h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	const next = () => {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		return ((h ^= h >>> 16) >>> 0) / 4294967296;
	};
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(next() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
