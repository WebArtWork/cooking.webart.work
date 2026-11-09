import { Type } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { buildRouteMeta } from '@wawjs/ngx-default';
import { companyProfile } from './feature/company/company.data';
import type { ExploreCard } from './pages/explore-types';

/**
 * A detail page of Explore at /<kind>/<slug>. Each kind has its own page and its own data, loaded on demand;
 * the data also gives the page title and description.
 */
const detail = (
	kind: string,
	component: () => Promise<Type<unknown>>,
	items: () => Promise<ExploreCard[]>,
) => ({
	path: kind + '/:slug',
	loadComponent: component,
	resolve: {
		item: (route: ActivatedRouteSnapshot) =>
			items().then((list) => list.find((item) => item.slug === route.paramMap.get('slug'))),
		meta: async (route: ActivatedRouteSnapshot) => {
			const slug = route.paramMap.get('slug');
			const item = (await items()).find((card) => card.slug === slug);
			return {
				...buildRouteMeta(companyProfile, '/' + kind + '/' + slug),
				title: item?.name ?? 'Page not found',
				description: item?.text.en ?? '',
				...(item ? {} : { robots: 'noindex, follow' }),
			};
		},
	},
	data: { meta: buildRouteMeta(companyProfile, '/explore') },
});

/** The pages the cards of Explore open. They load as a group, so the first bundle stays small. */
export const EXPLORE_ROUTES: Routes = [
	detail(
		'restaurant',
		() => import('./pages/restaurant/restaurant.component').then((m) => m.RestaurantComponent),
		() => import('./pages/restaurant/restaurant.data').then((m) => m.RESTAURANTS),
	),
	detail(
		'recipe',
		() => import('./pages/recipe/recipe.component').then((m) => m.RecipeComponent),
		() => import('./pages/recipe/recipe.data').then((m) => m.RECIPES),
	),
	detail(
		'chef',
		() => import('./pages/chef/chef.component').then((m) => m.ChefComponent),
		() => import('./pages/chef/chef.data').then((m) => m.CHEFS),
	),
	detail(
		'school',
		() => import('./pages/school/school.component').then((m) => m.SchoolComponent),
		() => import('./pages/school/school.data').then((m) => m.SCHOOLS),
	),
	detail(
		'course',
		() => import('./pages/course/course.component').then((m) => m.CourseComponent),
		() => import('./pages/course/course.data').then((m) => m.COURSES),
	),
	detail(
		'employee',
		() => import('./pages/employee/employee.component').then((m) => m.EmployeeComponent),
		() => import('./pages/employee/employee.data').then((m) => m.EMPLOYEES),
	),
];
