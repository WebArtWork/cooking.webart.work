import { computed } from '@angular/core';
import type { CookingCatalogFilters } from './catalog-filters.service';
import { COOKING_GROUPS, COOKING_THEORIES } from './theories';

/** The topics with the lessons that match the search and topic filter. */
export function catalogResults(filters: CookingCatalogFilters) {
	const results = computed(() => {
		const q = filters.query().trim().toLocaleLowerCase(),
			group = filters.group();
		return COOKING_GROUPS.filter((g) => !group || g.id === group)
			.map((g) => ({
				...g,
				lessons: COOKING_THEORIES.filter(
					(t) =>
						t.group === g.id &&
						(!q ||
							[
								t.id,
								String(t.id).padStart(3, '0'),
								t.title.en,
								t.title.ua,
								t.summary.en,
								t.summary.ua,
							]
								.join(' ')
								.toLocaleLowerCase()
								.includes(q)),
				),
			}))
			.filter((g) => g.lessons.length);
	});
	const count = computed(() => results().reduce((sum, g) => sum + g.lessons.length, 0));
	return { results, count };
}
