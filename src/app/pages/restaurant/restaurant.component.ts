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
import { EMPLOYEES } from '../employee/employee.data';
import { pickText } from '../explore-types';
import { RECIPES } from '../recipe/recipe.data';
import type { Restaurant } from './restaurant.data';

const TABS = [
	{ id: 'info', label: 'Info' },
	{ id: 'menu', label: 'Menu' },
	{ id: 'chefs', label: 'Chefs' },
	{ id: 'employees', label: 'Employees' },
] as const;

/**
 * One restaurant: tabs on top; the Info tab opens with a picture spot and the name, then its useful information, its menu (recipes),
 * its chefs and its employees. The tab is kept in the address (?tab=menu).
 */
@Component({
	imports: [CardListComponent, IconComponent, TabsComponent, TPipe],
	template: `
		@if (item(); as restaurant) {
			<article class="cook-detail cook-restaurant">
				<app-tabs
					idPrefix="restaurant"
					label="Restaurant sections"
					[tabs]="tabs"
					[active]="tab.active()"
					(selected)="tab.select($event)"
				/>
				@if (tab.active() === 'info') {
					<div class="cook-restaurant-hero">
						<div class="cook-illustration cook-illustration-tall" role="img" [attr.aria-label]="'Illustration placeholder' | t">
							<app-icon name="rank-soup" />
						</div>
						<div>
							<p class="cook-card-meta">{{ text(restaurant.meta) }}</p>
							<h1>{{ restaurant.name }}</h1>
							<p class="cook-lead">{{ text(restaurant.text) }}</p>
						</div>
					</div>

				} @else {
					<h1 class="sr-only">{{ restaurant.name }}</h1>
				}
				@switch (tab.active()) {
					@case ('info') {
						<div role="tabpanel" id="restaurant-panel-info" aria-labelledby="restaurant-tab-info" class="cook-panel">
							<dl class="cook-facts cook-facts-grid">
								<div>
									<dt>{{ 'Address' | t }}</dt>
									<dd>{{ text(restaurant.address) }}</dd>
								</div>
								<div>
									<dt>{{ 'Opening hours' | t }}</dt>
									<dd>{{ text(restaurant.hours) }}</dd>
								</div>
								<div>
									<dt>{{ 'Phone' | t }}</dt>
									<dd>{{ restaurant.phone }}</dd>
								</div>
								<div>
									<dt>{{ 'Wi-Fi network' | t }}</dt>
									<dd>{{ restaurant.wifi.network }}</dd>
								</div>
								<div>
									<dt>{{ 'Wi-Fi password' | t }}</dt>
									<dd>{{ restaurant.wifi.password }}</dd>
								</div>
								<div>
									<dt>{{ 'Payment' | t }}</dt>
									<dd>{{ text(restaurant.payment) }}</dd>
								</div>
								<div>
									<dt>{{ 'Price' | t }}</dt>
									<dd>{{ text(restaurant.price) }}</dd>
								</div>
							</dl>
							<section>
								<h2>{{ 'About this place' | t }}</h2>
								<p>{{ text(restaurant.about) }}</p>
							</section>
							<section>
								<h2>{{ 'Features' | t }}</h2>
								<ul class="cook-chips">
									@for (feature of restaurant.features; track feature.en) {
										<li>{{ text(feature) }}</li>
									}
								</ul>
							</section>
							<section>
								<h2>{{ 'Signature dishes' | t }}</h2>
								<ul class="cook-dishes">
									@for (dish of restaurant.dishes; track dish.name.en) {
										<li>
											<div class="cook-illustration cook-illustration-thumb" role="img" [attr.aria-label]="'Illustration placeholder' | t">
												<app-icon name="rank-bowl" />
											</div>
											<div>
												<h3>{{ text(dish.name) }}</h3>
												<p>{{ text(dish.text) }}</p>
											</div>
										</li>
									}
								</ul>
							</section>
						</div>
					}
					@case ('menu') {
						<div role="tabpanel" id="restaurant-panel-menu" aria-labelledby="restaurant-tab-menu" class="cook-panel">
							<app-card-list [items]="menu()" kind="recipe" icon="rank-egg" />
						</div>
					}
					@case ('chefs') {
						<div role="tabpanel" id="restaurant-panel-chefs" aria-labelledby="restaurant-tab-chefs" class="cook-panel">
							<app-card-list [items]="chefs" kind="chef" icon="rank-chef" />
						</div>
					}
					@case ('employees') {
						<div role="tabpanel" id="restaurant-panel-employees" aria-labelledby="restaurant-tab-employees" class="cook-panel">
							<app-card-list [items]="employees" kind="employee" icon="users" />
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
export class RestaurantComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly language = inject(I18nService).language;
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly tabs = TABS;
	protected readonly chefs = CHEFS;
	protected readonly employees = EMPLOYEES;
	protected readonly item = computed(() => this.data()['item'] as Restaurant | undefined);
	/** The recipes on this restaurant's menu. */
	protected readonly menu = computed(() =>
		(this.item()?.menu ?? []).flatMap((slug) => RECIPES.filter((recipe) => recipe.slug === slug)),
	);
	protected readonly tab = useQueryTab(TABS);
	protected text = (value: Parameters<typeof pickText>[0]) => pickText(value, this.language());
}
