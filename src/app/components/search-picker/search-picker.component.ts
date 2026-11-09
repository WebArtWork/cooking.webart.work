import { Component, computed, input, output, signal } from '@angular/core';

export interface PickerOption {
	id: string;
	label: string;
	/** A short line shown beside the label to tell similar options apart. */
	hint?: string;
}

/**
 * A search field with a list of matches: type, move with the arrow keys, choose with Enter or a click. It only
 * offers what `search` returns, and the field is cleared after a choice. The parent decides what a choice does.
 */
@Component({
	selector: 'app-search-picker',
	template: `
		<div class="cook-picker">
			<input
				class="cook-picker-input"
				type="text"
				role="combobox"
				autocomplete="off"
				aria-autocomplete="list"
				[attr.aria-controls]="idPrefix() + '-options'"
				[attr.aria-expanded]="open()"
				[attr.aria-activedescendant]="open() ? idPrefix() + '-option-' + active() : null"
				[attr.aria-label]="ariaLabel()"
				[placeholder]="placeholder()"
				[value]="query()"
				(input)="typed($any($event.target))"
				(keydown)="keydown($event)"
				(focus)="focused.set(true)"
				(blur)="focused.set(false)"
			/>
			@if (open()) {
				<ul class="cook-suggestions" [id]="idPrefix() + '-options'" role="listbox" [attr.aria-label]="ariaLabel()">
					@for (option of options(); track option.id; let i = $index) {
						<li
							role="option"
							[id]="idPrefix() + '-option-' + i"
							[attr.aria-selected]="i === active()"
							[class.is-active]="i === active()"
							(mousedown)="$event.preventDefault()"
							(click)="choose(option)"
						>
							<span>{{ option.label }}</span>
							@if (option.hint) {
								<small>{{ option.hint }}</small>
							}
						</li>
					}
				</ul>
			}
			@if (focused() && query().trim() && !options().length) {
				<p class="cook-suggestions-empty" role="status">{{ emptyText() }}</p>
			}
		</div>
	`,
})
export class SearchPickerComponent {
	/** Returns the options that fit the text typed so far. */
	readonly search = input.required<(query: string) => PickerOption[]>();
	readonly idPrefix = input.required<string>();
	readonly ariaLabel = input.required<string>();
	readonly placeholder = input('');
	/** The words shown when nothing fits. */
	readonly emptyText = input('');
	readonly picked = output<string>();

	protected readonly query = signal('');
	protected readonly focused = signal(false);
	protected readonly active = signal(0);
	protected readonly options = computed(() => this.search()(this.query()));
	protected readonly open = computed(() => this.focused() && this.options().length > 0);

	protected typed(input: HTMLInputElement) {
		this.query.set(input.value);
		this.active.set(0);
	}

	protected keydown(event: KeyboardEvent) {
		const list = this.options();
		switch (event.key) {
			case 'ArrowDown':
				if (!list.length) return;
				event.preventDefault();
				this.focused.set(true);
				this.active.set((this.active() + 1) % list.length);
				break;
			case 'ArrowUp':
				if (!list.length) return;
				event.preventDefault();
				this.active.set((this.active() + list.length - 1) % list.length);
				break;
			case 'Enter':
				event.preventDefault();
				if (list[this.active()]) this.choose(list[this.active()]);
				break;
			case 'Escape':
				if (this.focused()) {
					event.preventDefault();
					this.focused.set(false);
				}
				break;
		}
	}

	protected choose(option: PickerOption) {
		this.picked.emit(option.id);
		this.query.set('');
		this.active.set(0);
		// the field itself is cleared too: the value may not change, so the binding would not update it
		const field = document.querySelector<HTMLInputElement>(`[aria-controls="${this.idPrefix()}-options"]`);
		if (field) field.value = '';
	}
}
