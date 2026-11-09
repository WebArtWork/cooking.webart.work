import { afterNextRender, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CookingCatalogFilters } from '../../feature/cooking/catalog-filters.service';
import { catalogResults } from '../../feature/cooking/catalog-results';
import { COOKING_GROUPS, localize } from '../../feature/cooking/theories';
import { CookingStudyService } from '../../feature/cooking/study.service';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { CookingControlsComponent } from './controls.component';

/** Where the opened topics are remembered in this browser. */
const OPEN_TOPICS_KEY = 'cooking_open_topics';

@Component({
	imports: [RouterLink, TPipe, CookingControlsComponent],
	templateUrl: './catalog.component.html',
})
export class CookingCatalogComponent {
	protected readonly language = inject(I18nService).language;
	protected readonly study = inject(CookingStudyService);
	protected readonly filters = inject(CookingCatalogFilters);
	protected readonly results = catalogResults(this.filters).results;
	protected readonly pick = localize;
	/** The topics the reader left open; null until one is opened or closed, when the first topic is open. */
	private readonly openTopics = signal<string[] | null>(null);
	constructor() {
		this.filters.init(inject(ActivatedRoute).snapshot.queryParamMap);
		// read after the first render, so the prerendered page and the browser start with the same markup
		afterNextRender(() => {
			try {
				const raw: unknown = JSON.parse(localStorage.getItem(OPEN_TOPICS_KEY) ?? 'null');
				if (Array.isArray(raw))
					this.openTopics.set(raw.filter((id): id is string => typeof id === 'string'));
			} catch {}
		});
	}
	/** A search or topic filter opens every topic it found; otherwise the remembered ones are open. */
	protected isOpen(id: string, first: boolean) {
		return this.filters.active() || (this.openTopics()?.includes(id) ?? first);
	}
	protected toggled(id: string, open: boolean) {
		if (this.filters.active()) return;
		const current = this.openTopics() ?? [COOKING_GROUPS[0].id];
		if (current.includes(id) === open) return;
		const next = open ? [...current, id] : current.filter((value) => value !== id);
		this.openTopics.set(next);
		try {
			localStorage.setItem(OPEN_TOPICS_KEY, JSON.stringify(next));
		} catch {
			/* The choice lasts for this visit. */
		}
	}
}
