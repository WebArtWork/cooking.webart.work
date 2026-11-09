import { Component } from '@angular/core';
import { CardListComponent } from '../../components/card-list/card-list.component';
import type { IconName } from '../../components/icon/icon.data';
import { TabsComponent } from '../../components/tabs/tabs.component';
import { useQueryTab } from '../../components/tabs/query-tab';
import { TPipe } from '../../feature/i18n/t.pipe';
import { CHEFS } from '../chef/chef.data';
import { COURSES } from '../course/course.data';
import { EMPLOYEES } from '../employee/employee.data';
import { RECIPES } from '../recipe/recipe.data';
import { RESTAURANTS } from '../restaurant/restaurant.data';
import { SCHOOLS } from '../school/school.data';

const TABS = [
	{ id: 'restaurants', label: 'Restaurants', icon: 'rank-soup', kind: 'restaurant' },
	{ id: 'recipes', label: 'Recipes', icon: 'rank-egg', kind: 'recipe' },
	{ id: 'chefs', label: 'Chefs', icon: 'rank-chef', kind: 'chef' },
	{ id: 'schools', label: 'Schools', icon: 'study', kind: 'school' },
	{ id: 'courses', label: 'Courses', icon: 'play', kind: 'course' },
	{ id: 'employees', label: 'Employees', icon: 'users', kind: 'employee' },
] as const satisfies readonly { id: string; label: string; icon: IconName; kind: string }[];

const CONTENT = {
	restaurants: RESTAURANTS,
	recipes: RECIPES,
	chefs: CHEFS,
	schools: SCHOOLS,
	courses: COURSES,
	employees: EMPLOYEES,
};

/**
 * Explore: tabs for the places and people around cooking. The cards are static samples that open their own
 * pages (/restaurant/..., /recipe/..., and so on); the dashed boxes mark where illustrations will go.
 */
@Component({
	imports: [CardListComponent, TabsComponent, TPipe],
	template: `
		<section class="cook-explore" aria-labelledby="explore-title">
			<h1 id="explore-title" class="sr-only">{{ 'Explore' | t }}</h1>
			<app-tabs
				idPrefix="explore"
				label="Explore"
				[tabs]="tabs"
				[active]="active()"
				(selected)="select($event)"
			/>
			@for (tab of tabs; track tab.id) {
				<div
					role="tabpanel"
					[id]="'explore-panel-' + tab.id"
					[attr.aria-labelledby]="'explore-tab-' + tab.id"
					[hidden]="active() !== tab.id"
				>
					@if (active() === tab.id) {
						<app-card-list [items]="content[tab.id]" [kind]="tab.kind" [icon]="tab.icon" />
					}
				</div>
			}
		</section>
	`,
})
export class CookingExploreComponent {
	protected readonly tabs = TABS;
	protected readonly content = CONTENT;
	private readonly state = useQueryTab(TABS);
	protected readonly active = this.state.active;
	protected readonly select = this.state.select;
}
