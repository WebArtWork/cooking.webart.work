import { afterNextRender, computed, Service, signal } from '@angular/core';

/** Where the results are kept in this browser. */
const STORAGE_KEY = 'cooking_practice';

/**
 * Practice results, kept on this device: for every exercise, whether the last answer was right. Exercises
 * never answered are simply missing.
 */
@Service()
export class CookingPracticeService {
	/** Exercise id to whether the latest answer was correct. */
	readonly results = signal<Record<string, boolean>>({});
	readonly correctCount = computed(() => Object.values(this.results()).filter(Boolean).length);

	constructor() {
		// read after the first render, so the prerendered page and the browser start with the same markup
		afterNextRender(() => {
			try {
				const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
				if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
					const clean: Record<string, boolean> = {};
					for (const [id, value] of Object.entries(raw)) if (typeof value === 'boolean') clean[id] = value;
					this.results.set(clean);
				}
			} catch {}
		});
	}

	record(id: string, correct: boolean) {
		this.results.update((results) => ({ ...results, [id]: correct }));
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.results()));
		} catch {
			/* The results last for this visit. */
		}
	}

	/** How many exercises of a theory were answered, and how many of those correctly (ids look like cooking-003-02). */
	forTheory(theoryId: number) {
		const prefix = `cooking-${String(theoryId).padStart(3, '0')}-`;
		let answered = 0;
		let correct = 0;
		for (const [id, ok] of Object.entries(this.results())) {
			if (!id.startsWith(prefix)) continue;
			answered++;
			if (ok) correct++;
		}
		return { answered, correct };
	}
}
