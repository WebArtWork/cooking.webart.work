import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Search and topic filter of the theories list, shared by the page and the phone's top bar.
 * Holds state only, so the catalog data stays out of the first bundle (see catalog-results.ts).
 */
@Service()
export class CookingCatalogFilters {
	private readonly router = inject(Router);
	readonly query = signal('');
	readonly group = signal('');
	/** The filter panel under the phone's top bar. */
	readonly panelOpen = signal(false);
	readonly active = computed(() => !!this.query().trim() || !!this.group());
	/** Restores the filters from the address when the list opens. */
	init(params: { get(name: string): string | null }) {
		this.query.set(params.get('q') ?? '');
		this.group.set(params.get('topic') ?? '');
	}
	updateQuery(value: string) {
		this.query.set(value);
		this.save();
	}
	updateGroup(value: string) {
		this.group.set(value);
		this.save();
	}
	clear() {
		this.query.set('');
		this.group.set('');
		this.save();
	}
	private save() {
		void this.router.navigate([this.router.url.split(/[?#]/)[0]], {
			queryParams: { q: this.query() || null, topic: this.group() || null },
			replaceUrl: true,
		});
	}
}
