import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { countryName } from '../cook/geography.data';
import { regionsWithCounts, searchWorldRecipes, timeLabel, WORLD_RECIPES } from './world-recipes.data';

const PAGE = 48;

/** Every world recipe: search by dish or country in either language, filter by region, then open one. */
@Component({
	imports: [RouterLink, TPipe],
	template: `
		<section class="cook-page" aria-labelledby="recipes-title">
			<h1 id="recipes-title" class="cooking-head">{{ 'World recipes' | t }}</h1>
			<p class="cooking-head">
				{{ '{count} dishes from around the world, each with steps, ingredients and times.' | t: { count: total } }}
			</p>

			<div class="cook-recipe-filters">
				<label class="sr-only" for="recipe-search">{{ 'Search recipes' | t }}</label>
				<input
					id="recipe-search"
					class="ds-input"
					type="search"
					[placeholder]="'Search by dish or country' | t"
					[value]="query()"
					(input)="setQuery($any($event.target).value)"
				/>
				<label class="sr-only" for="recipe-region">{{ 'Region' | t }}</label>
				<select id="recipe-region" class="ds-select" [value]="region()" (change)="setRegion($any($event.target).value)">
					<option value="">{{ 'All regions' | t }}</option>
					@for (item of regions(); track item.id) {
						<option [value]="item.id">{{ item.name }} ({{ item.count }})</option>
					}
				</select>
			</div>

			<p class="cook-card-meta" role="status">
				{{ '{count} recipes' | t: { count: results().length } }}
			</p>

			@if (results().length) {
				<ul class="cook-card-grid">
					@for (row of shown(); track row.slug) {
						<li>
							<a class="cook-card" [routerLink]="['/recipes', row.slug]">
								<h2>{{ row.title[language()] }}</h2>
								<p class="cook-card-meta">{{ country(row.country) }} · {{ time(row.minutes) }}</p>
								<p>
									{{ '{n} servings, {m} ingredients' | t: { n: row.servings, m: row.ingredientCount } }}
								</p>
							</a>
						</li>
					}
				</ul>
				@if (results().length > shown().length) {
					<p>
						<button class="ds-btn ds-btn-outline" type="button" (click)="more()">
							{{ 'Show more' | t }}
						</button>
					</p>
				}
			} @else {
				<div class="ds-card cooking-empty">
					<h2>{{ 'No recipes found' | t }}</h2>
					<p>{{ 'Try another word or clear your filters.' | t }}</p>
					<button class="ds-btn ds-btn-primary" type="button" (click)="clear()">{{ 'Clear filters' | t }}</button>
				</div>
			}
		</section>
	`,
})
export class RecipesComponent {
	protected readonly language = inject(I18nService).language as unknown as () => 'en' | 'ua';
	protected readonly total = WORLD_RECIPES.length;
	protected readonly query = signal('');
	protected readonly region = signal('');
	private readonly limit = signal(PAGE);

	protected readonly regions = computed(() => regionsWithCounts(this.language()));
	protected readonly results = computed(() => searchWorldRecipes(this.query(), this.region()));
	protected readonly shown = computed(() => this.results().slice(0, this.limit()));

	protected country = (code: string) => countryName(code, this.language());
	protected time = (minutes: number) => timeLabel(minutes, this.language());

	protected setQuery(value: string) {
		this.query.set(value);
		this.limit.set(PAGE);
	}
	protected setRegion(value: string) {
		this.region.set(value);
		this.limit.set(PAGE);
	}
	protected more() {
		this.limit.update((n) => n + PAGE);
	}
	protected clear() {
		this.setQuery('');
		this.setRegion('');
	}
}
