import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { countryName, regionById } from '../cook/geography.data';
import { capitalize, ingredientById, unitById } from '../cook/ingredients.data';
import { techniqueById } from '../cook/techniques.data';
import { timeLabel, type WorldRecipe } from './world-recipes.data';

type Language = 'en' | 'ua';

/** One world recipe: facts, the ingredients added up from its steps (scaled to the servings you pick), then the steps. */
@Component({
	imports: [RouterLink, TPipe],
	template: `
		@if (recipe(); as r) {
			<article class="cook-detail cook-recipe">
				<p><a [routerLink]="['/recipes']">← {{ 'All recipes' | t }}</a></p>
				<h1>{{ r.title[language()] }}</h1>
				<ul class="cook-chips">
					<li>{{ country(r.country) }}, {{ region(r.region) }}</li>
					<li>{{ time(r.minutes) }}</li>
				</ul>
				<p class="cook-lead">{{ r.text[language()] }}</p>

				<section class="cook-panel">
					<h2>{{ 'Ingredients' | t }}</h2>
					<div class="cook-recipe-servings" role="group" [attr.aria-label]="'Servings' | t">
						<button class="ds-btn ds-btn-outline" type="button" [disabled]="servings() <= 1" [attr.aria-label]="'Fewer servings' | t" (click)="change(-1)">−</button>
						<span role="status">{{ '{n} servings' | t: { n: servings() } }}</span>
						<button class="ds-btn ds-btn-outline" type="button" [disabled]="servings() >= 99" [attr.aria-label]="'More servings' | t" (click)="change(1)">+</button>
					</div>
					<ul class="cook-ingredients">
						@for (item of totals(); track item.key) {
							<li>{{ item.text }}</li>
						}
					</ul>
				</section>

				<section class="cook-panel">
					<h2>{{ 'Method' | t }}</h2>
					<ol class="cook-steps">
						@for (step of r.steps; track $index) {
							<li>
								{{ step[language()] }}
								@if (step.m) {
									<span class="cook-card-meta"> · {{ time(step.m) }}</span>
								}
								@if (step.t.length) {
									<span class="cook-card-meta"> · {{ techniques(step.t) }}</span>
								}
							</li>
						}
					</ol>
				</section>
			</article>
		} @else {
			<section class="cook-page">
				<h1>{{ 'Page not found' | t }}</h1>
				<p><a [routerLink]="['/recipes']">{{ 'All recipes' | t }}</a></p>
			</section>
		}
	`,
})
export class RecipeDetailComponent {
	protected readonly language = inject(I18nService).language as unknown as () => Language;
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly recipe = computed(() => this.data()['recipe'] as WorldRecipe | undefined);
	/** null until the reader changes it: then the recipe's own servings. */
	private readonly picked = signal<number | null>(null);
	protected readonly servings = computed(() => this.picked() ?? this.recipe()?.servings ?? 1);

	/** The ingredients of the whole recipe: the same ingredient in the same unit is summed, then scaled. */
	protected readonly totals = computed(() => {
		const r = this.recipe();
		if (!r) return [];
		const language = this.language();
		const scale = this.servings() / r.servings;
		const rows = new Map<string, { id: string; amount: number | null; unit: string }>();
		for (const step of r.steps)
			for (const [id, amount, unit] of step.i) {
				const key = `${id}|${unit}`;
				const row = rows.get(key);
				if (row) row.amount = row.amount === null && amount === null ? null : (row.amount ?? 0) + (amount ?? 0);
				else rows.set(key, { id, amount, unit });
			}
		return [...rows.entries()].map(([key, row]) => {
			const name = capitalize(ingredientById(row.id)?.[language] ?? row.id);
			const unit = unitById(row.unit)?.[language] ?? row.unit;
			const text =
				row.unit === 'to_taste' || row.amount === null ? `${name}: ${unit.toLocaleLowerCase()}` : `${name}: ${this.format(row.amount * scale)} ${unit.toLocaleLowerCase()}`;
			return { key, text };
		});
	});

	protected country = (code: string) => countryName(code, this.language());
	protected region = (id: string) => regionById(id)?.name[this.language()] ?? id;
	protected time = (minutes: number) => timeLabel(minutes, this.language());
	protected techniques = (ids: string[]) => ids.map((id) => capitalize(techniqueById(id)?.[this.language()] ?? id)).join(', ');

	protected change(by: number) {
		this.picked.set(Math.min(99, Math.max(1, this.servings() + by)));
	}

	private format(value: number) {
		const rounded = value >= 100 ? Math.round(value) : Math.round(value * 100) / 100;
		return rounded.toLocaleString(this.language() === 'ua' ? 'uk' : 'en', { maximumFractionDigits: 2 });
	}
}
