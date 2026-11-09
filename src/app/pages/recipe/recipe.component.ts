import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CardListComponent } from '../../components/card-list/card-list.component';
import { IconComponent } from '../../components/icon/icon.component';
import { TabsComponent } from '../../components/tabs/tabs.component';
import { useQueryTab } from '../../components/tabs/query-tab';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { CHEFS } from '../chef/chef.data';
import { pickText } from '../explore-types';
import { RESTAURANTS } from '../restaurant/restaurant.data';
import { SCHOOLS } from '../school/school.data';
import type { Recipe } from './recipe.data';

const TABS = [
	{ id: 'info', label: 'Info' },
	{ id: 'cook', label: 'Cook' },
	{ id: 'restaurants', label: 'Restaurants' },
	{ id: 'chefs', label: 'Chefs' },
	{ id: 'schools', label: 'Schools' },
] as const;

/**
 * One recipe: a wide picture spot, time and servings, then tabs: the ingredients and a tip, the numbered
 * steps to cook it, the restaurants that serve it, and the chefs and schools.
 */
@Component({
	imports: [CardListComponent, IconComponent, TabsComponent, TPipe],
	template: `
		@if (item(); as recipe) {
			<article class="cook-detail cook-recipe">
				<app-tabs
					idPrefix="recipe"
					label="Recipe sections"
					[tabs]="tabs"
					[active]="tab.active()"
					(selected)="tab.select($event)"
				/>
				@if (tab.active() === 'info') {
					<div class="cook-illustration cook-illustration-wide" role="img" [attr.aria-label]="'Illustration placeholder' | t">
						<app-icon name="rank-egg" />
					</div>
					<h1>{{ recipe.name }}</h1>
					<ul class="cook-chips">
						<li>{{ text(recipe.meta) }}</li>
						<li>{{ text(recipe.servings) }}</li>
					</ul>
					<p class="cook-lead">{{ text(recipe.text) }}</p>
				} @else {
					<h1 class="sr-only">{{ recipe.name }}</h1>
				}
				@switch (tab.active()) {
					@case ('info') {
						<div role="tabpanel" id="recipe-panel-info" aria-labelledby="recipe-tab-info" class="cook-panel">
							<section>
								<h2>{{ 'Ingredients' | t }}</h2>
								<ul class="cook-ingredients">
									@for (ingredient of recipe.ingredients; track ingredient.en) {
										<li>{{ text(ingredient) }}</li>
									}
								</ul>
							</section>
							<aside class="cook-callout">
								<h2>{{ 'Tip' | t }}</h2>
								<p>{{ text(recipe.tip) }}</p>
							</aside>
						</div>
					}
					@case ('cook') {
						<div role="tabpanel" id="recipe-panel-cook" aria-labelledby="recipe-tab-cook" class="cook-panel">
							<h2>{{ 'Method' | t }}</h2>
							<ol class="cook-steps">
								@for (step of recipe.steps; track step.en) {
									<li>{{ text(step) }}</li>
								}
							</ol>
						</div>
					}
					@case ('restaurants') {
						<div role="tabpanel" id="recipe-panel-restaurants" aria-labelledby="recipe-tab-restaurants" class="cook-panel">
							<app-card-list [items]="restaurants()" kind="restaurant" icon="rank-soup" />
						</div>
					}
					@case ('chefs') {
						<div role="tabpanel" id="recipe-panel-chefs" aria-labelledby="recipe-tab-chefs" class="cook-panel">
							<app-card-list [items]="chefs" kind="chef" icon="rank-chef" />
						</div>
					}
					@case ('schools') {
						<div role="tabpanel" id="recipe-panel-schools" aria-labelledby="recipe-tab-schools" class="cook-panel">
							<app-card-list [items]="schools" kind="school" icon="study" />
						</div>
					}
				}
			</article>
		} @else {
			<section class="cook-page">
				<h1>{{ 'Page not found' | t }}</h1>
			</section>
		}
	`,
})
export class RecipeComponent {
	private readonly language = inject(I18nService).language;
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly tabs = TABS;
	protected readonly tab = useQueryTab(TABS);
	protected readonly chefs = CHEFS;
	protected readonly schools = SCHOOLS;
	protected readonly item = computed(() => this.data()['item'] as Recipe | undefined);
	/** The restaurants that have this recipe on their menu. */
	protected readonly restaurants = computed(() =>
		RESTAURANTS.filter((restaurant) => restaurant.menu.includes(this.item()?.slug ?? '')),
	);
	protected text = (value: Parameters<typeof pickText>[0]) => pickText(value, this.language());
}
