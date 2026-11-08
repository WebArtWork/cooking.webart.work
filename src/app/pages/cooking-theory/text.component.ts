import { Component, computed, input } from '@angular/core';

/** Render source emphasis as text and strong elements; supplied HTML is never executed. */
@Component({
	selector: 'app-cooking-text',
	// prettier-ignore
	template: `@for (part of parts(); track $index) {@if ($odd) {<strong [textContent]="part"></strong>} @else {<span [textContent]="part"></span>}}`,
	styles: ':host { white-space: pre-line; overflow-wrap: anywhere; }',
})
export class CookingTextComponent {
	readonly text = input.required<string>();
	protected readonly parts = computed(() => this.text().split('**'));
}
