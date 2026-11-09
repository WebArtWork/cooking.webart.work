import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '@wawjs/ngx-ui';
import { CardListComponent } from '../../components/card-list/card-list.component';
import { IconComponent } from '../../components/icon/icon.component';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { RECIPES } from '../recipe/recipe.data';
import { CameraModalComponent } from './camera-modal.component';
import { capitalize, categoryLabel, type Ingredient, ingredientById, ingredientByName, searchIngredients } from './ingredients.data';

/** Where the chosen ingredients (their ids) are kept in this browser. */
const STORAGE_KEY = 'cooking_ingredient_ids';

/**
 * Cook: the ingredients you have, chosen from the list of known ingredients and shown as tags, and a camera
 * button that opens a modal to take a photo. Recipes are listed below; each opens its recipe page. Only ingredients from the list can be added. The photo is not
 * used yet; later it will be analysed to find ingredients.
 */
@Component({
	imports: [CardListComponent, IconComponent, RouterLink, TPipe],
	template: `
		<section class="cook-page cook-ingredients-page" aria-labelledby="cook-title">
			<h1 id="cook-title" class="sr-only">{{ 'Ingredients' | t }}</h1>
			<div class="cook-tag-field">
				<ul class="cook-tag-list" [attr.aria-label]="'Ingredients' | t">
					@for (item of chosen(); track item.id) {
						<li class="cook-tag">
							<span>{{ label(item) }}</span>
							<button
								type="button"
								[attr.aria-label]="'Remove {name}' | t: { name: label(item) }"
								(click)="remove(item.id)"
							>
								<app-icon name="close" />
							</button>
						</li>
					}
				</ul>
				<input
					class="cook-tag-input"
					type="text"
					role="combobox"
					autocomplete="off"
					aria-autocomplete="list"
					aria-controls="cook-ingredient-options"
					[attr.aria-expanded]="open()"
					[attr.aria-activedescendant]="open() ? 'cook-ingredient-option-' + active() : null"
					[value]="draft()"
					[attr.aria-label]="'Add an ingredient' | t"
					[placeholder]="'Add an ingredient' | t"
					(input)="typed($any($event.target))"
					(keydown)="keydown($event)"
					(focus)="opened.set(true)"
					(blur)="opened.set(false)"
				/>
				<button
					class="cook-camera-btn"
					type="button"
					[attr.aria-label]="'Take a photo of your ingredients' | t"
					[attr.title]="'Take a photo of your ingredients' | t"
					(click)="openCamera()"
				>
					<app-icon name="camera" />
				</button>
				@if (open()) {
					<ul class="cook-suggestions" id="cook-ingredient-options" role="listbox" [attr.aria-label]="'Ingredients' | t">
						@for (item of suggestions(); track item.id; let i = $index) {
							<li
								role="option"
								[id]="'cook-ingredient-option-' + i"
								[attr.aria-selected]="i === active()"
								[class.is-active]="i === active()"
								(mousedown)="$event.preventDefault()"
								(click)="choose(item)"
							>
								<span>{{ label(item) }}</span>
								<small>{{ where(item) }}</small>
							</li>
						}
					</ul>
				}
				@if (opened() && draft().trim() && !suggestions().length) {
					<p class="cook-suggestions-empty" role="status">{{ 'No matching ingredient' | t }}</p>
				}
			</div>
			<a class="ds-btn ds-btn-primary cook-create" routerLink="/cook/recipe">{{ 'Create a recipe' | t }}</a>
			<div class="cook-recipes">
				<app-card-list [items]="recipes" kind="recipe" icon="rank-egg" />
			</div>
		</section>
	`,
})
export class CookComponent {
	private readonly modal = inject(ModalService);
	private readonly language = inject(I18nService).language;
	protected readonly recipes = RECIPES;
	protected readonly ids = signal<string[]>([]);
	protected readonly draft = signal('');
	/** The field has focus. */
	protected readonly opened = signal(false);
	/** The highlighted suggestion. */
	protected readonly active = signal(0);
	protected readonly chosen = computed(() =>
		this.ids().flatMap((id) => {
			const item = ingredientById(id);
			return item ? [item] : [];
		}),
	);
	protected readonly suggestions = computed(() => searchIngredients(this.draft(), this.ids()));
	protected readonly open = computed(() => this.opened() && this.suggestions().length > 0);

	constructor() {
		// read after the first render, so the prerendered page and the browser start with the same markup
		afterNextRender(() => {
			try {
				const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
				if (Array.isArray(raw)) {
					this.ids.set(raw.filter((id): id is string => typeof id === 'string' && !!ingredientById(id)));
				}
			} catch {}
		});
	}

	protected label(item: Ingredient) {
		return capitalize(this.language() === 'ua' ? item.ua : item.en);
	}

	/** Where the ingredient belongs, shown under its name to tell similar ones apart. */
	protected where(item: Ingredient) {
		return categoryLabel(item, this.language() === 'ua' ? 'ua' : 'en');
	}

	/** A comma finishes the names before it: known ones become tags, unknown ones stay in the field. */
	protected typed(input: HTMLInputElement) {
		const parts = input.value.split(',');
		let rest = parts.pop() ?? '';
		const unknown: string[] = [];
		for (const part of parts) {
			const match = ingredientByName(part);
			if (match) this.add(match.id);
			else if (part.trim()) unknown.push(part.trim());
		}
		rest = [...unknown, rest].join(', ');
		if (rest !== input.value) input.value = rest;
		this.draft.set(rest);
		this.active.set(0);
	}

	protected keydown(event: KeyboardEvent) {
		const list = this.suggestions();
		switch (event.key) {
			case 'ArrowDown':
				if (!list.length) return;
				event.preventDefault();
				this.opened.set(true);
				this.active.set((this.active() + 1) % list.length);
				break;
			case 'ArrowUp':
				if (!list.length) return;
				event.preventDefault();
				this.active.set((this.active() + list.length - 1) % list.length);
				break;
			case 'Enter': {
				event.preventDefault();
				// the highlighted suggestion, or the ingredient that was typed in full
				const pick = list[this.active()] ?? ingredientByName(this.draft());
				if (pick) this.choose(pick);
				break;
			}
			case 'Escape':
				if (this.opened()) {
					event.preventDefault();
					this.opened.set(false);
				}
				break;
			case 'Backspace': {
				if (this.draft()) return;
				const ids = this.ids();
				if (ids.length) this.remove(ids[ids.length - 1]);
				break;
			}
		}
	}

	protected choose(item: Ingredient) {
		this.add(item.id);
		this.draft.set('');
		this.active.set(0);
		const field = document.querySelector<HTMLInputElement>('.cook-tag-input');
		if (field) field.value = '';
	}

	private add(id: string) {
		if (!this.ids().includes(id)) this.save([...this.ids(), id]);
	}

	protected remove(id: string) {
		this.save(this.ids().filter((item) => item !== id));
	}

	private save(ids: string[]) {
		this.ids.set(ids);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
		} catch {
			/* The list lasts for this visit. */
		}
	}

	/** Opens the camera. The photo is only held by the modal for now. */
	protected openCamera() {
		this.modal.show({
			component: CameraModalComponent,
			size: 'mid',
			ariaLabelledBy: 'camera-title',
			// opening it again while it is open does nothing
			unique: 'camera',
		});
	}
}
