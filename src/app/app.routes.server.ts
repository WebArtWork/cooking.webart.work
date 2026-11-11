import { RenderMode, ServerRoute } from '@angular/ssr';
const prerender = (kind: string, slugs: () => Promise<{ slug: string }[]>): ServerRoute => ({
	path: kind + '/:slug',
	renderMode: RenderMode.Prerender,
	getPrerenderParams: async () => (await slugs()).map(({ slug }) => ({ slug })),
});
export const serverRoutes: ServerRoute[] = [
	// a practice session depends on what the learner answers, so it is drawn in the browser
	{ path: 'practices/:slug', renderMode: RenderMode.Client },
	// one page per recipe, 1,400 of them: drawn in the browser, from the recipe's own file
	{ path: 'recipes/:slug', renderMode: RenderMode.Client },
	{ path: 'profile', renderMode: RenderMode.Client },
	{ path: 'sign-in', renderMode: RenderMode.Client },
	prerender('restaurant', () => import('./pages/restaurant/restaurant.data').then((m) => m.RESTAURANTS)),
	prerender('recipe', () => import('./pages/recipe/recipe.data').then((m) => m.RECIPES)),
	prerender('chef', () => import('./pages/chef/chef.data').then((m) => m.CHEFS)),
	prerender('school', () => import('./pages/school/school.data').then((m) => m.SCHOOLS)),
	prerender('course', () => import('./pages/course/course.data').then((m) => m.COURSES)),
	prerender('employee', () => import('./pages/employee/employee.data').then((m) => m.EMPLOYEES)),
	{ path: '**', renderMode: RenderMode.Prerender },
];
