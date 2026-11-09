import { Component, computed, inject, signal } from '@angular/core';
import { CookingCatalogFilters } from '../../feature/cooking/catalog-filters.service';
import { catalogResults } from '../../feature/cooking/catalog-results';
import { COOKING_GROUPS, COOKING_THEORIES, localize } from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';

const GROUPS = COOKING_GROUPS.map((group) => ({
	...group,
	lessons: COOKING_THEORIES.filter((theory) => theory.group === group.id),
}));

/**
 * The theories to print, in the ngx-ui modal (see CookingPrintService.openPicker): every topic with its
 * lessons and a checkbox for each. The checkbox of a topic selects or clears all of its lessons.
 * ModalService sets `close` and `onPrint` on the instance. Only the detailed text is printed.
 */
@Component({
	selector: 'app-cooking-print-modal',
	imports: [TPipe],
	template: `
		<div class="flex flex-col gap-4">
			<h2 id="print-title" class="text-xl font-semibold">{{ 'Select theories to print' | t }}</h2>
			<div class="flex flex-wrap items-center gap-2">
				<button class="ds-btn ds-btn-outline" type="button" (click)="setAll(true)">
					{{ 'Select all' | t }}
				</button>
				<button class="ds-btn ds-btn-outline" type="button" (click)="setAll(false)">
					{{ 'Clear selection' | t }}
				</button>
				<span class="text-sm text-mute" role="status">{{
					'{count} of 288 selected' | t: { count: count() }
				}}</span>
			</div>
			<div class="max-h-[50dvh] overflow-y-auto">
				@for (group of groups; track group.id) {
					<details class="cooking-print-group">
						<summary>
							<label class="flex min-h-11 flex-1 items-center gap-3" (click)="$event.stopPropagation()">
								<input
									type="checkbox"
									[checked]="state(group) === 'all'"
									[indeterminate]="state(group) === 'some'"
									(change)="toggleGroup(group, $any($event.target).checked)"
								/>
								<span class="font-medium">{{ pick(group.title, language()) }}</span>
							</label>
							<span class="text-sm text-mute">{{ selectedIn(group) }}/{{ group.lessons.length }}</span>
						</summary>
						<ul>
							@for (lesson of group.lessons; track lesson.id) {
								<li>
									<label class="flex min-h-11 items-start gap-3 py-2 pl-8">
										<input
											class="mt-1"
											type="checkbox"
											[checked]="selected().has(lesson.slug)"
											(change)="toggle(lesson.slug, $any($event.target).checked)"
										/>
										<span>{{ lesson.id }}. {{ pick(lesson.title, language()) }}</span>
									</label>
								</li>
							}
						</ul>
					</details>
				}
			</div>
			<div class="flex flex-wrap justify-end gap-2">
				<button class="ds-btn ds-btn-outline" type="button" (click)="close()">
					{{ 'Cancel' | t }}
				</button>
				<button
					class="ds-btn ds-btn-primary"
					type="button"
					[disabled]="count() === 0"
					(click)="print()"
				>
					{{ 'Print selected' | t }}
				</button>
			</div>
		</div>
	`,
})
export class CookingPrintModalComponent {
	protected readonly language = inject(I18nService).language;
	protected readonly groups = GROUPS;
	protected readonly pick = localize;
	close!: () => void;
	/** Starts the print for the chosen lessons. */
	onPrint!: (slugs: string[]) => void;
	/** Lessons matching an active search or topic filter start selected, otherwise all. */
	protected readonly selected = signal(
		new Set(
			(() => {
				const filters = inject(CookingCatalogFilters);
				return filters.active()
					? catalogResults(filters)
							.results()
							.flatMap((group) => group.lessons.map((lesson) => lesson.slug))
					: COOKING_THEORIES.map((theory) => theory.slug);
			})(),
		),
	);
	protected readonly count = computed(() => this.selected().size);

	protected selectedIn(group: (typeof GROUPS)[number]) {
		return group.lessons.filter((lesson) => this.selected().has(lesson.slug)).length;
	}
	protected state(group: (typeof GROUPS)[number]) {
		const n = this.selectedIn(group);
		return n === 0 ? 'none' : n === group.lessons.length ? 'all' : 'some';
	}
	protected toggle(slug: string, on: boolean) {
		this.selected.update((set) => {
			const next = new Set(set);
			if (on) next.add(slug);
			else next.delete(slug);
			return next;
		});
	}
	protected toggleGroup(group: (typeof GROUPS)[number], on: boolean) {
		this.selected.update((set) => {
			const next = new Set(set);
			for (const lesson of group.lessons) {
				if (on) next.add(lesson.slug);
				else next.delete(lesson.slug);
			}
			return next;
		});
	}
	protected setAll(on: boolean) {
		this.selected.set(new Set(on ? COOKING_THEORIES.map((theory) => theory.slug) : []));
	}
	protected print() {
		// keep the reading order of the catalog
		const slugs = COOKING_THEORIES.filter((theory) => this.selected().has(theory.slug)).map(
			(theory) => theory.slug,
		);
		this.close();
		this.onPrint(slugs);
	}
}
