/** An ingredient used in one step, with how much of it. */
export interface StepIngredient {
	/** Id from the ingredient catalog. */
	ingredientId: string;
	/** How much; null while it is not filled in, and when the unit is "to taste". */
	amount: number | null;
	/** Id of a unit (g, ml, tbsp, pcs, to_taste, and so on). */
	unit: string;
}

/**
 * One step of a recipe. The ingredients of the recipe come from its steps, so every ingredient is listed in the
 * step where it is used.
 */
export interface RecipeStep {
	id: string;
	/** What to do, in the language the author writes in. */
	instruction: string;
	/** Optional cooking techniques used in this step: ids from the technique catalog. */
	techniqueIds: string[];
	/** Optional time for this step, in minutes. */
	durationMinutes: number | null;
	ingredients: StepIngredient[];
}

/** A recipe as the author builds it: where it comes from, and steps that carry the ingredients. */
export interface RecipeDraft {
	id: string;
	title: string;
	description: string;
	/** Id of a geographic region (see REGIONS). */
	regionId: string;
	/** ISO 3166-1 alpha-2 code of the country, a member of that region. */
	countryCode: string;
	servings: number;
	steps: RecipeStep[];
	/** When it was last changed, in milliseconds. */
	updatedAt: number;
}

const rid = () => Math.random().toString(36).slice(2, 10);

export const newStep = (): RecipeStep => ({ id: rid(), instruction: '', techniqueIds: [], durationMinutes: null, ingredients: [] });

export const newRecipe = (): RecipeDraft => ({
	id: rid(),
	title: '',
	description: '',
	regionId: '',
	countryCode: '',
	servings: 4,
	steps: [newStep()],
	updatedAt: Date.now(),
});

/** The ingredients of the whole recipe, added up from its steps: the same ingredient in the same unit is summed. */
export function summarize(recipe: RecipeDraft) {
	const rows = new Map<string, StepIngredient>();
	for (const step of recipe.steps) {
		for (const item of step.ingredients) {
			const key = `${item.ingredientId}|${item.unit}`;
			const row = rows.get(key);
			if (row) row.amount = row.amount === null && item.amount === null ? null : (row.amount ?? 0) + (item.amount ?? 0);
			else rows.set(key, { ...item });
		}
	}
	return [...rows.values()];
}

/** What is still missing before the recipe is complete (English keys, translated where shown). */
export function missing(recipe: RecipeDraft): string[] {
	const list: string[] = [];
	if (!recipe.title.trim()) list.push('A title');
	if (!recipe.regionId) list.push('A region');
	if (!recipe.countryCode) list.push('A country');
	if (!recipe.steps.some((step) => step.instruction.trim())) list.push('At least one step with instructions');
	return list;
}

/** Reads a typed amount; a comma counts as the decimal separator. Empty or invalid gives null. */
export function parseAmount(text: string): number | null {
	const cleaned = text.trim().replace(/\s/g, '').replace(',', '.');
	if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
	return Number(cleaned);
}

/** Checks a value read from storage and keeps only what fits the interface, so old or broken data cannot break the page. */
export function readDraft(raw: unknown): RecipeDraft | null {
	if (!raw || typeof raw !== 'object') return null;
	const r = raw as Partial<RecipeDraft>;
	const base = newRecipe();
	const steps = Array.isArray(r.steps)
		? r.steps.map((s) => ({
				id: typeof s?.id === 'string' ? s.id : rid(),
				instruction: typeof s?.instruction === 'string' ? s.instruction : '',
				techniqueIds: Array.isArray(s?.techniqueIds) ? s.techniqueIds.filter((id): id is string => typeof id === 'string') : [],
				durationMinutes: typeof s?.durationMinutes === 'number' ? s.durationMinutes : null,
				ingredients: Array.isArray(s?.ingredients)
					? s.ingredients
							.filter((i) => typeof i?.ingredientId === 'string' && typeof i?.unit === 'string')
							.map((i) => ({ ingredientId: i.ingredientId, unit: i.unit, amount: typeof i.amount === 'number' ? i.amount : null }))
					: [],
			}))
		: base.steps;
	return {
		id: typeof r.id === 'string' ? r.id : base.id,
		title: typeof r.title === 'string' ? r.title : '',
		description: typeof r.description === 'string' ? r.description : '',
		regionId: typeof r.regionId === 'string' ? r.regionId : '',
		countryCode: typeof r.countryCode === 'string' ? r.countryCode : '',
		servings: typeof r.servings === 'number' && r.servings > 0 ? r.servings : 4,
		steps: steps.length ? steps : base.steps,
		updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : Date.now(),
	};
}
