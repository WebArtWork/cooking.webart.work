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
import type { Course } from './course.data';

const TABS = [
	{ id: 'info', label: 'Info' },
	{ id: 'recipes', label: 'Recipes' },
	{ id: 'chefs', label: 'Chefs' },
] as const;

/**
 * One course: tabs on top. The Info tab opens with a picture spot, level and length, then who it is for, the
 * syllabus and the outcome; the other tabs list the recipes it teaches and the chefs.
 */
@Component({
	imports: [CardListComponent, IconComponent, TabsComponent, TPipe],
	template: `
		@if (item(); as course) {
			<article class="cook-detail cook-course">
				<app-tabs
					idPrefix="course"
					label="Course sections"
					[tabs]="tabs"
					[active]="tab.active()"
					(selected)="tab.select($event)"
				/>
				@if (tab.active() === 'info') {
					<div class="cook-illustration cook-illustration-wide" role="img" [attr.aria-label]="'Illustration placeholder' | t">
						<app-icon name="play" />
					</div>
					<h1>{{ course.name }}</h1>
					<ul class="cook-chips">
						<li>{{ text(course.level) }}</li>
						<li>{{ text(course.length) }}</li>
					</ul>
					<p class="cook-lead">{{ text(course.text) }}</p>
				} @else {
					<h1 class="sr-only">{{ course.name }}</h1>
				}
				@switch (tab.active()) {
					@case ('info') {
						<div role="tabpanel" id="course-panel-info" aria-labelledby="course-tab-info" class="cook-panel">
							<section>
								<h2>{{ 'Who it is for' | t }}</h2>
								<p>{{ text(course.audience) }}</p>
							</section>
							<section>
								<h2>{{ 'Syllabus' | t }}</h2>
								<ol class="cook-syllabus">
									@for (module of course.modules; track module.title.en) {
										<li>
											<h3>{{ text(module.title) }}</h3>
											<p>{{ text(module.text) }}</p>
										</li>
									}
								</ol>
							</section>
							<aside class="cook-callout">
								<h2>{{ 'Outcome' | t }}</h2>
								<p>{{ text(course.outcome) }}</p>
							</aside>
						</div>
					}
					@case ('recipes') {
						<div role="tabpanel" id="course-panel-recipes" aria-labelledby="course-tab-recipes" class="cook-panel">
							<app-card-list [items]="recipes()" kind="recipe" icon="rank-egg" />
						</div>
					}
					@case ('chefs') {
						<div role="tabpanel" id="course-panel-chefs" aria-labelledby="course-tab-chefs" class="cook-panel">
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
export class CourseComponent {
	private readonly language = inject(I18nService).language;
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly tabs = TABS;
	protected readonly tab = useQueryTab(TABS);
	protected readonly chefs = CHEFS;
	protected readonly item = computed(() => this.data()['item'] as Course | undefined);
	/** The recipes this course teaches. */
	protected readonly recipes = computed(() =>
		RECIPES.filter((recipe) => this.item()?.recipes.includes(recipe.slug)),
	);
	protected text = (value: Parameters<typeof pickText>[0]) => pickText(value, this.language());
}
