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
import { RECIPES } from '../recipe/recipe.data';
import type { School } from './school.data';

const TABS = [
	{ id: 'info', label: 'Info' },
	{ id: 'recipes', label: 'Recipes' },
	{ id: 'chefs', label: 'Chefs' },
] as const;

/**
 * One school: a campus banner spot, then tabs: its story, programme and admission facts, the recipes it
 * teaches, and the chefs.
 */
@Component({
	imports: [CardListComponent, IconComponent, TabsComponent, TPipe],
	template: `
		@if (item(); as school) {
			<article class="cook-detail cook-school">
				<app-tabs
					idPrefix="school"
					label="School sections"
					[tabs]="tabs"
					[active]="tab.active()"
					(selected)="tab.select($event)"
				/>
				@if (tab.active() === 'info') {
					<div class="cook-illustration cook-illustration-wide" role="img" [attr.aria-label]="'Illustration placeholder' | t">
						<app-icon name="study" />
					</div>
					<p class="cook-card-meta">{{ text(school.meta) }}</p>
					<h1>{{ school.name }}</h1>
				} @else {
					<h1 class="sr-only">{{ school.name }}</h1>
				}
				@switch (tab.active()) {
					@case ('info') {
						<div role="tabpanel" id="school-panel-info" aria-labelledby="school-tab-info" class="cook-panel">
							<section>
								<h2>{{ 'About the school' | t }}</h2>
								<p>{{ text(school.about) }}</p>
							</section>
							<section>
								<h2>{{ 'Programme' | t }}</h2>
								<ol class="cook-programme">
									@for (part of school.programme; track part.title.en) {
										<li>
											<h3>{{ text(part.title) }}</h3>
											<p>{{ text(part.text) }}</p>
										</li>
									}
								</ol>
							</section>
							<section>
								<h2>{{ 'Admission' | t }}</h2>
								<dl class="cook-facts">
									<div>
										<dt>{{ 'Duration' | t }}</dt>
										<dd>{{ text(school.length) }}</dd>
									</div>
									<div>
										<dt>{{ 'City' | t }}</dt>
										<dd>{{ text(school.city) }}</dd>
									</div>
								</dl>
								<p>{{ text(school.admission) }}</p>
							</section>
						</div>
					}
					@case ('recipes') {
						<div role="tabpanel" id="school-panel-recipes" aria-labelledby="school-tab-recipes" class="cook-panel">
							<app-card-list [items]="recipes()" kind="recipe" icon="rank-egg" />
						</div>
					}
					@case ('chefs') {
						<div role="tabpanel" id="school-panel-chefs" aria-labelledby="school-tab-chefs" class="cook-panel">
							<app-card-list [items]="chefs" kind="chef" icon="rank-chef" />
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
export class SchoolComponent {
	private readonly language = inject(I18nService).language;
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly tabs = TABS;
	protected readonly tab = useQueryTab(TABS);
	protected readonly chefs = CHEFS;
	protected readonly item = computed(() => this.data()['item'] as School | undefined);
	/** The recipes this school teaches. */
	protected readonly recipes = computed(() =>
		RECIPES.filter((recipe) => this.item()?.recipes.includes(recipe.slug)),
	);
	protected text = (value: Parameters<typeof pickText>[0]) => pickText(value, this.language());
}
