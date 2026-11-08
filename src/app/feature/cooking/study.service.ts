import { afterNextRender, Service, signal } from '@angular/core';

/** Device-local study marks stay available even when Firebase is not configured. */
@Service()
export class CookingStudyService {
	readonly marked = signal<string[]>([]);
	constructor() {
		afterNextRender(() => {
			try {
				const raw: unknown = JSON.parse(localStorage.getItem('cooking_reading') ?? '[]');
				if (Array.isArray(raw))
					this.marked.set(raw.filter((v): v is string => typeof v === 'string'));
			} catch {}
		});
	}
	toggle(slug: string) {
		this.marked.update((values) =>
			values.includes(slug) ? values.filter((v) => v !== slug) : [...values, slug],
		);
		try {
			localStorage.setItem('cooking_reading', JSON.stringify(this.marked()));
		} catch {
			/* Marks remain available for this visit. */
		}
	}
}
