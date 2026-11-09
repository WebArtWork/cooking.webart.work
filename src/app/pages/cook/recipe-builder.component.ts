import { afterNextRender, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { type PickerOption, SearchPickerComponent } from '../../components/search-picker/search-picker.component';
import { COOKING_THEORIES } from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { countriesOf, REGIONS } from './geography.data';
import { capitalize, categoryLabel, ingredientById, searchIngredients, UNITS, unitById } from './ingredients.data';
import { missing, newRecipe, newStep, parseAmount, readDraft, type RecipeDraft, type RecipeStep, summarize } from './recipe-draft';
import { SAFETY, searchTechniques, techniqueById, techniqueCategory } from './techniques.data';

/** Where the recipe in progress is kept in this browser. */
const STORAGE_KEY = 'cooking_recipe_draft';

/**
 * Recipe builder: a recipe is only its steps. Each step has instructions, optional techniques, an optional
 * time and the ingredients it uses with their amounts; the ingredient list of the recipe is added up from the
 * steps. The recipe also says which region and country it comes from. The draft is saved on this device.
 */
@Component({
	imports: [IconComponent, RouterLink, SearchPickerComponent, TPipe],
	template: `
		<section class="cook-page cook-builder" aria-labelledby="builder-title">
			<h1 id="builder-title">{{ 'New recipe' | t }}</h1>

			<div class="cook-fields">
				<label class="cook-field">
					<span>{{ 'Title' | t }}</span>
					<input type="text" [value]="recipe().title" (input)="patch({ title: $any($event.target).value })" />
				</label>
				<label class="cook-field">
					<span>{{ 'Short description (optional)' | t }}</span>
					<textarea rows="2" [value]="recipe().description" (input)="patch({ description: $any($event.target).value })"></textarea>
				</label>
				<div class="cook-field-row">
					<label class="cook-field">
						<span>{{ 'Region' | t }}</span>
						<select [value]="recipe().regionId" (change)="setRegion($any($event.target).value)">
							<option value="" [selected]="!recipe().regionId">{{ 'Choose a region' | t }}</option>
							@for (region of regions; track region.id) {
								<option [value]="region.id" [selected]="recipe().regionId === region.id">{{ ua() ? region.name.ua : region.name.en }}</option>
							}
						</select>
					</label>
					<label class="cook-field">
						<span>{{ 'Country' | t }}</span>
						<select [value]="recipe().countryCode" [disabled]="!recipe().regionId" (change)="patch({ countryCode: $any($event.target).value })">
							<option value="" [selected]="!recipe().countryCode">{{ 'Choose a country' | t }}</option>
							@for (country of countries(); track country.code) {
								<option [value]="country.code" [selected]="recipe().countryCode === country.code">{{ country.name }}</option>
							}
						</select>
					</label>
					<label class="cook-field cook-field-small">
						<span>{{ 'Servings' | t }}</span>
						<input type="number" min="1" max="100" [value]="recipe().servings" (input)="setServings($any($event.target).value)" />
					</label>
				</div>
			</div>

			<h2>{{ 'Steps' | t }}</h2>
			<ol class="cook-steps-builder">
				@for (step of recipe().steps; track step.id; let i = $index; let first = $first; let last = $last) {
					<li class="cook-step-card">
						<div class="cook-step-head">
							<h3>{{ 'Step {number}' | t: { number: i + 1 } }}</h3>
							<span class="cook-step-tools">
								<button type="button" [disabled]="first" [attr.aria-label]="'Move step up' | t" (click)="moveStep(i, -1)">↑</button>
								<button type="button" [disabled]="last" [attr.aria-label]="'Move step down' | t" (click)="moveStep(i, 1)">↓</button>
								<button type="button" [attr.aria-label]="'Remove step' | t" (click)="removeStep(i)"><app-icon name="close" /></button>
							</span>
						</div>

						<label class="cook-field">
							<span>{{ 'What to do' | t }}</span>
							<textarea rows="3" [value]="step.instruction" (input)="patchStep(i, { instruction: $any($event.target).value })"></textarea>
						</label>

						<div class="cook-field cook-field-small">
							<label [for]="'minutes-' + step.id">{{ 'Time in minutes (optional)' | t }}</label>
							<input [id]="'minutes-' + step.id" type="number" min="0" [value]="step.durationMinutes ?? ''" (input)="patchStep(i, { durationMinutes: minutes($any($event.target).value) })" />
						</div>

						<div class="cook-field">
							<span>{{ 'Techniques (optional)' | t }}</span>
							@if (step.techniqueIds.length) {
								<ul class="cook-chips cook-technique-chips">
									@for (id of step.techniqueIds; track id) {
										<li>
											{{ techniqueName(id) }}
											<button type="button" [attr.aria-label]="'Remove {name}' | t: { name: techniqueName(id) }" (click)="removeTechnique(i, id)"><app-icon name="close" /></button>
										</li>
									}
								</ul>
								@for (note of techniqueNotes(step); track note) {
									<p class="cook-technique-note" role="note">{{ note }}</p>
								}
								@for (link of theoryLinks(step); track link.slug) {
									<a class="cook-technique-theory" [routerLink]="['/theories', link.slug]">{{ 'Read the theory' | t }}: {{ link.title }}</a>
								}
							}
							<app-search-picker
								[idPrefix]="'technique-' + step.id"
								[search]="techniqueSearch(step)"
								[ariaLabel]="'Add a technique' | t"
								[placeholder]="'Add a technique' | t"
								[emptyText]="'No matching technique' | t"
								(picked)="addTechnique(i, $event)"
							/>
						</div>

						<div class="cook-field">
							<span>{{ 'Ingredients in this step' | t }}</span>
							@if (step.ingredients.length) {
								<ul class="cook-step-ingredients">
									@for (item of step.ingredients; track $index; let j = $index) {
										<li>
											<span class="cook-step-ingredient-name">{{ ingredientName(item.ingredientId) }}</span>
											@if (!isToTaste(item.unit)) {
												<input
													class="cook-amount"
													type="text"
													inputmode="decimal"
													[value]="item.amount ?? ''"
													[attr.aria-label]="('Amount of {name}' | t: { name: ingredientName(item.ingredientId) })"
													(input)="setAmount(i, j, $any($event.target).value)"
												/>
											}
											<select [attr.aria-label]="('Unit for {name}' | t: { name: ingredientName(item.ingredientId) })" (change)="setUnit(i, j, $any($event.target).value)">
												@for (unit of units; track unit.id) {
													<option [value]="unit.id" [selected]="unit.id === item.unit">{{ ua() ? unit.ua : unit.en }}</option>
												}
											</select>
											<button type="button" [attr.aria-label]="'Remove {name}' | t: { name: ingredientName(item.ingredientId) }" (click)="removeIngredient(i, j)"><app-icon name="close" /></button>
										</li>
									}
								</ul>
							}
							<app-search-picker
								[idPrefix]="'ingredient-' + step.id"
								[search]="ingredientSearch"
								[ariaLabel]="'Add an ingredient' | t"
								[placeholder]="'Add an ingredient' | t"
								[emptyText]="'No matching ingredient' | t"
								(picked)="addIngredient(i, $event)"
							/>
						</div>
					</li>
				}
			</ol>
			<button class="ds-btn ds-btn-outline" type="button" (click)="addStep()">{{ 'Add a step' | t }}</button>

			<h2>{{ 'Ingredients' | t }}</h2>
			@if (summary().length) {
				<ul class="cook-summary">
					@for (row of summary(); track row.key) {
						<li>
							<span>{{ row.name }}</span>
							<span>{{ row.amount }}</span>
						</li>
					}
				</ul>
			} @else {
				<p class="cook-card-meta">{{ 'Ingredients appear here as you add them to the steps.' | t }}</p>
			}

			<div class="cook-builder-status" role="status">
				@if (todo().length) {
					<p>{{ 'Still needed:' | t }} {{ todoText() }}</p>
				} @else {
					<p>{{ 'The recipe is complete.' | t }}</p>
				}
			</div>
			<div class="cook-exercise-actions">
				<button class="ds-btn ds-btn-outline" type="button" (click)="copy()">{{ (copied() ? 'Copied' : 'Copy as JSON') | t }}</button>
				<button class="ds-btn ds-btn-outline" type="button" (click)="reset()">{{ 'Start over' | t }}</button>
			</div>
		</section>
	`,
})
export class RecipeBuilderComponent {
	private readonly i18n = inject(I18nService);
	private readonly language = this.i18n.language;
	protected readonly regions = REGIONS;
	protected readonly units = UNITS;
	protected readonly recipe = signal<RecipeDraft>(newRecipe());
	/** The saved draft has been read; before that nothing is saved, so an empty form cannot overwrite it. */
	private readonly loaded = signal(false);
	protected readonly copied = signal(false);

	protected readonly ua = computed(() => this.language() === 'ua');
	private readonly lang = computed<'en' | 'ua'>(() => (this.ua() ? 'ua' : 'en'));
	protected readonly countries = computed(() => countriesOf(this.recipe().regionId, this.lang()));
	protected readonly todo = computed(() => missing(this.recipe()));
	protected readonly todoText = computed(() => this.todo().map((key) => this.t(key)).join(', '));
	protected readonly summary = computed(() =>
		summarize(this.recipe()).map((row) => ({
			key: `${row.ingredientId}|${row.unit}`,
			name: this.ingredientName(row.ingredientId),
			amount: this.amountText(row.amount, row.unit),
		})),
	);

	constructor() {
		// read after the first render, so the prerendered page and the browser start with the same markup
		afterNextRender(() => {
			try {
				const draft = readDraft(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'));
				if (draft) this.recipe.set(draft);
			} catch {}
			this.loaded.set(true);
		});
		effect(() => {
			const recipe = this.recipe();
			if (!this.loaded()) return;
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(recipe));
			} catch {
				/* The draft lasts for this visit. */
			}
		});
	}

	private t(key: string) {
		return this.i18n.t(key);
	}

	protected ingredientName(id: string) {
		const item = ingredientById(id);
		return item ? capitalize(this.ua() ? item.ua : item.en) : id;
	}
	protected techniqueName(id: string) {
		const item = techniqueById(id);
		return item ? capitalize(this.ua() ? item.ua : item.en) : id;
	}
	protected isToTaste(unit: string) {
		return unitById(unit)?.type === 'qualitative';
	}
	private amountText(amount: number | null, unit: string) {
		const u = unitById(unit);
		const label = u ? (this.ua() ? u.ua : u.en) : unit;
		if (u?.type === 'qualitative') return label;
		return `${amount === null ? '' : Math.round(amount * 100) / 100} ${label}`.trim();
	}

	protected readonly ingredientSearch = (query: string): PickerOption[] =>
		searchIngredients(query, []).map((item) => ({
			id: item.id,
			label: capitalize(this.ua() ? item.ua : item.en),
			hint: categoryLabel(item, this.lang()),
		}));

	protected techniqueSearch(step: RecipeStep) {
		return (query: string): PickerOption[] =>
			searchTechniques(query, step.techniqueIds).map((item) => ({
				id: item.id,
				label: capitalize(this.ua() ? item.ua : item.en),
				hint: techniqueCategory(item, this.lang()),
			}));
	}

	/** Safety notes for the chosen techniques that need extra care. */
	protected techniqueNotes(step: RecipeStep) {
		const notes = new Set<string>();
		for (const id of step.techniqueIds) {
			for (const flag of techniqueById(id)?.flags ?? []) notes.add(SAFETY[flag].note[this.lang()]);
		}
		return [...notes];
	}

	/** The theories that explain the chosen techniques. */
	protected theoryLinks(step: RecipeStep) {
		const ids = new Set(step.techniqueIds.flatMap((id) => techniqueById(id)?.theoryIds ?? []));
		return [...ids].flatMap((id) => {
			const theory = COOKING_THEORIES.find((t) => t.id === id);
			return theory ? [{ slug: theory.slug, title: this.ua() ? theory.title.ua : theory.title.en }] : [];
		});
	}

	private change(fn: (recipe: RecipeDraft) => RecipeDraft) {
		this.recipe.update((recipe) => ({ ...fn(recipe), updatedAt: Date.now() }));
	}
	private changeStep(index: number, fn: (step: RecipeStep) => RecipeStep) {
		this.change((recipe) => ({ ...recipe, steps: recipe.steps.map((step, i) => (i === index ? fn(step) : step)) }));
	}

	protected patch(values: Partial<RecipeDraft>) {
		this.change((recipe) => ({ ...recipe, ...values }));
	}
	/** Changing the region clears a country that is not in it. */
	protected setRegion(regionId: string) {
		this.change((recipe) => ({
			...recipe,
			regionId,
			countryCode: REGIONS.find((r) => r.id === regionId)?.countries.includes(recipe.countryCode) ? recipe.countryCode : '',
		}));
	}
	protected setServings(value: string) {
		const n = Math.round(Number(value));
		if (n >= 1 && n <= 100) this.patch({ servings: n });
	}
	protected minutes(value: string) {
		const n = Math.round(Number(value));
		return value.trim() && n >= 0 ? n : null;
	}
	protected patchStep(index: number, values: Partial<RecipeStep>) {
		this.changeStep(index, (step) => ({ ...step, ...values }));
	}
	protected addStep() {
		this.change((recipe) => ({ ...recipe, steps: [...recipe.steps, newStep()] }));
	}
	protected removeStep(index: number) {
		this.change((recipe) => ({ ...recipe, steps: recipe.steps.length > 1 ? recipe.steps.filter((_, i) => i !== index) : [newStep()] }));
	}
	protected moveStep(index: number, by: number) {
		this.change((recipe) => {
			const steps = [...recipe.steps];
			[steps[index], steps[index + by]] = [steps[index + by], steps[index]];
			return { ...recipe, steps };
		});
	}
	protected addTechnique(index: number, id: string) {
		this.changeStep(index, (step) => (step.techniqueIds.includes(id) ? step : { ...step, techniqueIds: [...step.techniqueIds, id] }));
	}
	protected removeTechnique(index: number, id: string) {
		this.changeStep(index, (step) => ({ ...step, techniqueIds: step.techniqueIds.filter((t) => t !== id) }));
	}
	/** A new ingredient starts in grams, or "to taste" for salt and the like the author can switch to. */
	protected addIngredient(index: number, ingredientId: string) {
		this.changeStep(index, (step) => ({ ...step, ingredients: [...step.ingredients, { ingredientId, amount: null, unit: 'g' }] }));
	}
	protected removeIngredient(index: number, at: number) {
		this.changeStep(index, (step) => ({ ...step, ingredients: step.ingredients.filter((_, j) => j !== at) }));
	}
	protected setAmount(index: number, at: number, text: string) {
		this.changeStep(index, (step) => ({ ...step, ingredients: step.ingredients.map((item, j) => (j === at ? { ...item, amount: parseAmount(text) } : item)) }));
	}
	protected setUnit(index: number, at: number, unit: string) {
		this.changeStep(index, (step) => ({
			...step,
			ingredients: step.ingredients.map((item, j) => (j === at ? { ...item, unit, amount: unitById(unit)?.type === 'qualitative' ? null : item.amount } : item)),
		}));
	}

	protected async copy() {
		try {
			await navigator.clipboard.writeText(JSON.stringify(this.recipe(), null, 2));
			this.copied.set(true);
			setTimeout(() => this.copied.set(false), 2000);
		} catch {
			/* Copying needs a secure page and permission. */
		}
	}
	protected reset() {
		this.recipe.set(newRecipe());
	}
}
