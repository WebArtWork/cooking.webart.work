import { Component, computed, inject, input } from '@angular/core';
import { GlossaryService } from '../../feature/glossary/glossary.service';
import { I18nService } from '../../feature/i18n/i18n.service';

/**
 * Render source emphasis as text and strong elements; supplied HTML is never executed. Glossary terms are blue
 * buttons that open their explanation in a modal; `link` is false where text is printed.
 * The template has no whitespace between its pieces, so a term never adds a space to the text around it.
 */
@Component({
	selector: 'app-cooking-text',
	// prettier-ignore
	template: `@for (part of parts(); track $index) {@if ($odd) {<strong>@for (piece of part; track $index) {@if (piece.id; as id) {<button class="glossary-term" type="button" aria-haspopup="dialog" (click)="open(id)">{{ piece.text }}</button>} @else {{{ piece.text }}}}</strong>} @else {<span>@for (piece of part; track $index) {@if (piece.id; as id) {<button class="glossary-term" type="button" aria-haspopup="dialog" (click)="open(id)">{{ piece.text }}</button>} @else {{{ piece.text }}}}</span>}}`,
	styles: ':host { white-space: pre-line; overflow-wrap: anywhere; }',
})
export class CookingTextComponent {
	private readonly _glossary = inject(GlossaryService);
	private readonly _language = inject(I18nService).language;

	readonly text = input.required<string>();
	readonly link = input(true);

	/** Each part between the ** marks as pieces: plain text and glossary terms. Odd parts are bold. */
	protected readonly parts = computed(() => {
		const language = this._language() === 'ua' ? 'ua' : 'en';
		const linked = new Set<string>();
		return this.text()
			.split('**')
			.map((part) => {
				if (!this.link()) return [{ text: part }];
				// a term is linked once in the whole text, not once per part
				return this._glossary
					.segments(part, language)
					.map((piece) => (piece.id && linked.has(piece.id) ? { text: piece.text } : (piece.id && linked.add(piece.id), piece)));
			});
	});

	protected open(id: string) {
		void this._glossary.open(id);
	}
}
