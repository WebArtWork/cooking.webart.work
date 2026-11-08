import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { COOKING_GROUPS, COOKING_THEORIES, localize } from '../../feature/cooking/theories';
import { CookingStudyService } from '../../feature/cooking/study.service';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';

@Component({
	imports: [RouterLink, TPipe],
	templateUrl: './catalog.component.html',
})
export class CookingCatalogComponent {
	protected readonly language = inject(I18nService).language;
	protected readonly study = inject(CookingStudyService);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	protected readonly query = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
	protected readonly group = signal(this.route.snapshot.queryParamMap.get('topic') ?? '');
	protected readonly groups = COOKING_GROUPS;
	protected readonly pick = localize;
	protected readonly results = computed(() => {
		const q = this.query().trim().toLocaleLowerCase(),
			group = this.group();
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
	protected readonly count = computed(() =>
		this.results().reduce((sum, g) => sum + g.lessons.length, 0),
	);
	protected updateQuery(value: string) {
		this.query.set(value);
		this.saveFilters();
	}
	protected updateGroup(value: string) {
		this.group.set(value);
		this.saveFilters();
	}
	protected clear() {
		this.query.set('');
		this.group.set('');
		this.saveFilters();
	}
	private saveFilters() {
		void this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { q: this.query() || null, topic: this.group() || null },
			replaceUrl: true,
		});
	}
}
