import data from '../../../data/cooking/ingredients.json';

export interface Ingredient {
	/** Stable key that is saved; names can change, the id does not. */
	id: string;
	en: string;
	ua: string;
	/** Other names people use, in each language. */
	aliasesEn: string[];
	aliasesUa: string[];
	/** Position of the category and of the subcategory inside it. */
	category: number;
	sub: number;
}

interface Category {
	id: string;
	name: { en: string; ua: string };
	subs: { id: string; name: { en: string; ua: string } }[];
}

const CATEGORIES = data.categories as Category[];

/** Imported from content/cooking-ingredients by tools/ingredients/import-ingredients.mjs. */
export const INGREDIENTS: readonly Ingredient[] = (
	data.items as unknown as [string, string, string, string[], string[], number, number][]
).map(([id, en, ua, aliasesEn, aliasesUa, category, sub]) => ({ id, en, ua, aliasesEn, aliasesUa, category, sub }));

const BY_ID = new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]));

export const ingredientById = (id: string) => BY_ID.get(id);

/** Lower case, without apostrophes and with single spaces, so "Ma’s" and "mas" compare equal. */
const norm = (text: string) => text.toLocaleLowerCase().replace(/[’'ʼ`]/g, '').replace(/\s+/g, ' ').trim();

/** The names of each ingredient, normalized once: the two names first, then the aliases. */
const INDEX = INGREDIENTS.map((item) => ({
	item,
	names: [norm(item.en), norm(item.ua)],
	aliases: [...item.aliasesEn, ...item.aliasesUa].map(norm),
}));

/** The ingredient whose name or alias, in either language, is exactly `name`, ignoring case. */
export const ingredientByName = (name: string) => {
	const wanted = norm(name);
	if (!wanted) return undefined;
	return (
		INDEX.find((entry) => entry.names.includes(wanted))?.item ??
		INDEX.find((entry) => entry.aliases.includes(wanted))?.item
	);
};

/** How well a query fits one ingredient: lower is better, null when it does not fit at all. */
function score(entry: (typeof INDEX)[number], q: string): number | null {
	const startsWord = (text: string) => text.startsWith(q) || text.includes(' ' + q);
	let best: number | null = null;
	const take = (value: number) => {
		if (best === null || value < best) best = value;
	};
	for (const name of entry.names) {
		if (name === q) take(0);
		else if (name.startsWith(q)) take(1);
		else if (startsWord(name)) take(2);
		else if (name.includes(q)) take(3);
	}
	for (const alias of entry.aliases) {
		if (alias === q || alias.startsWith(q)) take(4);
		else if (alias.includes(q)) take(5);
	}
	return best;
}

/** Ingredients that fit `query` in either language, best fits first, without those already chosen. */
export function searchIngredients(query: string, exclude: readonly string[], limit = 10): Ingredient[] {
	const q = norm(query);
	if (!q) return [];
	const hits: { item: Ingredient; rank: number }[] = [];
	for (const entry of INDEX) {
		if (exclude.includes(entry.item.id)) continue;
		const rank = score(entry, q);
		if (rank !== null) hits.push({ item: entry.item, rank });
	}
	hits.sort((a, b) => a.rank - b.rank || a.item.en.length - b.item.en.length || a.item.en.localeCompare(b.item.en));
	return hits.slice(0, limit).map((hit) => hit.item);
}

/** The category and subcategory of an ingredient in one language, for example "Vegetables · Roots and tubers". */
export function categoryLabel(item: Ingredient, language: 'en' | 'ua'): string {
	const category = CATEGORIES[item.category];
	return `${category.name[language]} · ${category.subs[item.sub].name[language]}`;
}

/** Names in Ukrainian are written in lower case in the data; show them with a capital letter. */
export const capitalize = (text: string) => (text ? text[0].toLocaleUpperCase() + text.slice(1) : text);

export interface Unit {
	id: string;
	en: string;
	ua: string;
	/** mass, volume, count, package, volume_approx, approx or qualitative (to taste). */
	type: string;
}

/** The units a recipe can use for an amount of an ingredient. */
export const UNITS: readonly Unit[] = (data.units as unknown as [string, string, string, string][]).map(([id, en, ua, type]) => ({ id, en, ua, type }));

export const unitById = (id: string) => UNITS.find((unit) => unit.id === id);
