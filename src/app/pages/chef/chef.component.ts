import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CardListComponent } from '../../components/card-list/card-list.component';
import { IconComponent } from '../../components/icon/icon.component';
import { TabsComponent } from '../../components/tabs/tabs.component';
import { useQueryTab } from '../../components/tabs/query-tab';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { pickText } from '../explore-types';
import { RECIPES } from '../recipe/recipe.data';
import { RESTAURANTS } from '../restaurant/restaurant.data';
import { SCHOOLS } from '../school/school.data';
import type { Chef } from './chef.data';

const TABS = [
	{ id: 'info', label: 'Info' },
	{ id: 'recipes', label: 'Recipes' },
	{ id: 'restaurants', label: 'Restaurants' },
	{ id: 'schools', label: 'Schools' },
] as const;

/**
 * One chef: a round portrait spot, then tabs: a short bio with specialities and signature dishes, the
 * recipes the chef cooks, the restaurants where the chef works, and the schools.
 */
@Component({
	imports: [CardListComponent, IconComponent, TabsComponent, TPipe],
	template: `
		@if (item(); as chef) {
			<article class="cook-detail cook-chef">
				<app-tabs
					idPrefix="chef"
					label="Chef sections"
					[tabs]="tabs"
					[active]="tab.active()"
					(selected)="tab.select($event)"
				/>
				@if (tab.active() === 'info') {
					<header class="cook-chef-head">
						<div class="cook-illustration cook-portrait" role="img" [attr.aria-label]="'Illustration placeholder' | t">
							<app-icon name="rank-chef" />
						</div>
						<div>
							<p class="cook-card-meta">{{ text(chef.meta) }}</p>
							<h1>{{ chef.name }}</h1>
							<p class="cook-card-meta">{{ 'Experience' | t }}: {{ text(chef.experience) }}</p>
						</div>
					</header>
				} @else {
					<h1 class="sr-only">{{ chef.name }}</h1>
				}
				@switch (tab.active()) {
					@case ('info') {
						<div role="tabpanel" id="chef-panel-info" aria-labelledby="chef-tab-info" class="cook-panel">
							<section>
								<h2>{{ 'About the chef' | t }}</h2>
								<p>{{ text(chef.bio) }}</p>
							</section>
							<section>
								<h2>{{ 'Specialities' | t }}</h2>
								<ul class="cook-chips">
									@for (speciality of chef.specialities; track speciality.en) {
										<li>{{ text(speciality) }}</li>
									}
								</ul>
							</section>
							<section>
								<h2>{{ 'Signature dishes' | t }}</h2>
								<ul class="cook-signature">
									@for (dish of chef.signature; track dish.en) {
										<li>
											<div class="cook-illustration cook-illustration-square" role="img" [attr.aria-label]="'Illustration placeholder' | t">
												<app-icon name="rank-bowl" />
											</div>
											<span>{{ text(dish) }}</span>
										</li>
									}
								</ul>
							</section>
						</div>
					}
					@case ('recipes') {
						<div role="tabpanel" id="chef-panel-recipes" aria-labelledby="chef-tab-recipes" class="cook-panel">
							<app-card-list [items]="recipes()" kind="recipe" icon="rank-egg" />
						</div>
					}
					@case ('restaurants') {
						<div role="tabpanel" id="chef-panel-restaurants" aria-labelledby="chef-tab-restaurants" class="cook-panel">
							<app-card-list [items]="restaurants()" kind="restaurant" icon="rank-soup" />
						</div>
					}
					@case ('schools') {
						<div role="tabpanel" id="chef-panel-schools" aria-labelledby="chef-tab-schools" class="cook-panel">
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
export class ChefComponent {
	private readonly language = inject(I18nService).language;
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly tabs = TABS;
	protected readonly tab = useQueryTab(TABS);
	protected readonly schools = SCHOOLS;
	protected readonly item = computed(() => this.data()['item'] as Chef | undefined);
	protected readonly recipes = computed(() =>
		RECIPES.filter((recipe) => this.item()?.recipes.includes(recipe.slug)),
	);
	protected readonly restaurants = computed(() =>
		RESTAURANTS.filter((restaurant) => this.item()?.restaurants.includes(restaurant.slug)),
	);
	protected text = (value: Parameters<typeof pickText>[0]) => pickText(value, this.language());
}
