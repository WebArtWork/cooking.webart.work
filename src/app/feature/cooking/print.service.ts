import { inject, Service, signal } from '@angular/core';
import { ModalService } from '@wawjs/ngx-ui';
import type { CookingTheory } from './theories';

export interface PrintJob {
	theories: CookingTheory[];
}

/**
 * Prints theories from the list in place, without a separate page. The reader picks the lessons in a modal
 * (every topic with checkboxes); their texts and the picker load on demand, so none of it reaches the
 * first bundle.
 */
@Service()
export class CookingPrintService {
	private readonly modal = inject(ModalService);
	private picker: object | null = null;
	/** The lessons being printed; rendered only for the print dialog. */
	readonly job = signal<PrintJob | null>(null);
	readonly preparing = signal(false);
	readonly failed = signal(false);

	/** Opens the lesson picker. */
	async openPicker() {
		if (this.picker) return;
		this.picker = {};
		try {
			const { CookingPrintModalComponent } = await import(
				'../../pages/cooking-theory/print-modal.component'
			);
			this.modal.show({
				component: CookingPrintModalComponent,
				size: 'mid',
				ariaLabelledBy: 'print-title',
				onPrint: (slugs: string[]) => void this.print(slugs),
				onClose: () => (this.picker = null),
			});
		} catch {
			this.picker = null;
			this.failed.set(true);
		}
	}

	async print(slugs: string[]) {
		if (this.preparing() || !slugs.length) return;
		this.preparing.set(true);
		this.failed.set(false);
		try {
			const { loadCookingTheory } = await import('./theories');
			const theories = await Promise.all(slugs.map((slug) => loadCookingTheory(slug)));
			this.job.set({ theories });
			// let the document render before the dialog opens
			await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
			// some browsers return from print() before the dialog closes
			window.addEventListener('afterprint', () => this.job.set(null), { once: true });
			window.print();
		} catch {
			this.failed.set(true);
			this.job.set(null);
		} finally {
			this.preparing.set(false);
		}
	}
}
