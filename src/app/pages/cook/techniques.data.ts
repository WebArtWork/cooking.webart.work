import data from '../../../data/cooking/techniques.json';

export interface Technique {
	id: string;
	en: string;
	ua: string;
	aliasesEn: string[];
	aliasesUa: string[];
	category: number;
	sub: number;
	/** Positions in SAFETY of the notes that apply to this technique. */
	flags: number[];
	/** Theories that explain the technique. */
	theoryIds: number[];
}

interface Category {
	id: string;
	name: { en: string; ua: string };
	subs: { id: string; name: { en: string; ua: string } }[];
}

const CATEGORIES = data.categories as Category[];

/** Notes for the techniques that need extra care; shown when one of them is chosen. */
export const SAFETY = data.safety as { id: string; note: { en: string; ua: string } }[];

/** Imported from content/cooking-techniques by tools/techniques/import-techniques.mjs. */
export const TECHNIQUES: readonly Technique[] = (
	data.items as unknown as [string, string, string, string[], string[], number, number, number[], number[]][]
).map(([id, en, ua, aliasesEn, aliasesUa, category, sub, flags, theoryIds]) => ({ id, en, ua, aliasesEn, aliasesUa, category, sub, flags, theoryIds }));

const BY_ID = new Map(TECHNIQUES.map((technique) => [technique.id, technique]));

export const techniqueById = (id: string) => BY_ID.get(id);

const norm = (text: string) => text.toLocaleLowerCase().replace(/[’'ʼ`]/g, '').replace(/\s+/g, ' ').trim();

const INDEX = TECHNIQUES.map((item) => ({
	item,
	names: [norm(item.en), norm(item.ua)],
	aliases: [...item.aliasesEn, ...item.aliasesUa].map(norm),
}));

function score(entry: (typeof INDEX)[number], q: string): number | null {
	let best: number | null = null;
	const take = (value: number) => {
		if (best === null || value < best) best = value;
	};
	for (const name of entry.names) {
		if (name === q) take(0);
		else if (name.startsWith(q)) take(1);
		else if (name.includes(' ' + q)) take(2);
		else if (name.includes(q)) take(3);
	}
	for (const alias of entry.aliases) {
		if (alias === q || alias.startsWith(q)) take(4);
		else if (alias.includes(q)) take(5);
	}
	return best;
}

/** Techniques that fit `query` in either language, best fits first, without those already chosen. */
export function searchTechniques(query: string, exclude: readonly string[], limit = 10): Technique[] {
	const q = norm(query);
	if (!q) return [];
	const hits: { item: Technique; rank: number }[] = [];
	for (const entry of INDEX) {
		if (exclude.includes(entry.item.id)) continue;
		const rank = score(entry, q);
		if (rank !== null) hits.push({ item: entry.item, rank });
	}
	hits.sort((a, b) => a.rank - b.rank || a.item.en.length - b.item.en.length || a.item.en.localeCompare(b.item.en));
	return hits.slice(0, limit).map((hit) => hit.item);
}

export function techniqueCategory(item: Technique, language: 'en' | 'ua'): string {
	const category = CATEGORIES[item.category];
	return `${category.name[language]} · ${category.subs[item.sub].name[language]}`;
}
