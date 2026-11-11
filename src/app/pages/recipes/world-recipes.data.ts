import indexData from '../../../data/cooking/recipes-index.json';
import { RECIPE_LOADERS } from '../../feature/cooking/recipe.loaders';
import { countryName, regionById } from '../cook/geography.data';

type Language = 'en' | 'ua';
type Text = { en: string; ua: string };

/** One row of the list: what search and the filters need, nothing more. */
export interface WorldRecipeRow {
	slug: string;
	title: Text;
	country: string;
	region: string;
	servings: number;
	minutes: number;
	ingredientCount: number;
}

export interface WorldRecipeStep {
	en: string;
	ua: string;
	/** Technique ids. */
	t: string[];
	/** Minutes, or null. */
	m: number | null;
	/** Ingredients used in this step: [id, amount or null, unit id]. */
	i: [string, number | null, string][];
}

/** A whole recipe, loaded when its page opens. */
export interface WorldRecipe {
	slug: string;
	id: string;
	country: string;
	region: string;
	servings: number;
	minutes: number;
	title: Text;
	text: Text;
	steps: WorldRecipeStep[];
}

/** Imported from content/world-recipes by tools/recipes/import-recipes.mjs. */
export const WORLD_RECIPES: readonly WorldRecipeRow[] = (
	indexData.items as unknown as [string, string, string, string, string, number, number, number][]
).map(([slug, en, ua, country, region, servings, minutes, ingredientCount]) => ({
	slug,
	title: { en, ua },
	country,
	region,
	servings,
	minutes,
	ingredientCount,
}));

export const worldRecipeRow = (slug: string) => WORLD_RECIPES.find((row) => row.slug === slug);

export const loadWorldRecipe = async (slug: string): Promise<WorldRecipe | undefined> => {
	const load = RECIPE_LOADERS[slug];
	return load ? ((await load()).default as WorldRecipe) : undefined;
};

/** The regions that have recipes, in the app's order, with how many each has. */
export function regionsWithCounts(language: Language) {
	const counts = new Map<string, number>();
	for (const row of WORLD_RECIPES) counts.set(row.region, (counts.get(row.region) ?? 0) + 1);
	return [...counts.entries()].map(([id, count]) => ({ id, count, name: regionById(id)?.name[language] ?? id }));
}

/** Lower case, without apostrophes and accents, so "Ma’s" and "mas" compare equal. */
const norm = (text: string) =>
	text
		.toLocaleLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ’'ʼ`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

/** Words to search each row by: the title in both languages and the country in both languages. */
const HAYSTACK = WORLD_RECIPES.map((row) => norm([row.title.en, row.title.ua, countryName(row.country, 'en'), countryName(row.country, 'ua')].join(' | ')));

export function searchWorldRecipes(query: string, region: string): WorldRecipeRow[] {
	const q = norm(query);
	return WORLD_RECIPES.filter((row, index) => (!region || row.region === region) && (!q || HAYSTACK[index].includes(q)));
}

export const timeLabel = (minutes: number, language: Language) => {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	const hour = language === 'ua' ? 'год' : 'h';
	const min = language === 'ua' ? 'хв' : 'min';
	return h ? (m ? `${h} ${hour} ${m} ${min}` : `${h} ${hour}`) : `${m} ${min}`;
};
