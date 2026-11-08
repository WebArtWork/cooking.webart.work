import { Routes } from '@angular/router';
import { buildRouteMeta } from '@wawjs/ngx-default';
import { companyProfile } from './feature/company/company.data';
import cookingRoutes from '../data/cooking/routes.json';
import { COOKING_LOADERS } from './feature/cooking/theory.loaders';
import type { CookingTheory } from './feature/cooking/theories';
const loadCooking = () =>
	import('./pages/cooking/cooking.component').then((m) => m.CookingComponent);
const page = (path: string, mode: string) => ({ mode, meta: buildRouteMeta(companyProfile, path) });
// Preserve the copied Business content on disk, without publishing it as Cooking lessons.
export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: loadCooking,
		data: {
			...page('/', 'home'),
			meta: {
				...buildRouteMeta(companyProfile, '/'),
				title: companyProfile.title,
				titleSuffix: '',
			},
		},
	},
	{
		path: 'theories',
		loadComponent: () =>
			import('./pages/cooking-theory/catalog.component').then(
				(m) => m.CookingCatalogComponent,
			),
		data: page('/theories', 'theories'),
	},
	...(['short', 'full'] as const).map((version) => ({
		path: 'theories/print/' + version,
		loadComponent: () =>
			import('./pages/cooking-theory/print.component').then((m) => m.CookingPrintComponent),
		data: {
			version,
			meta: {
				title: version === 'full' ? 'Full cooking theories' : 'Short cooking theories',
				robots: 'noindex, follow',
			},
		},
	})),
	...cookingRoutes.map((theory) => ({
		path: 'theories/' + theory.slug,
		loadComponent: () =>
			import('./pages/cooking-theory/lesson.component').then((m) => m.CookingLessonComponent),
		resolve: {
			theory: () => COOKING_LOADERS[theory.slug]().then((m) => m.default),
			meta: async () => {
				const lesson = (await COOKING_LOADERS[theory.slug]()).default as CookingTheory;
				return {
					...buildRouteMeta(companyProfile, '/theories/' + theory.slug),
					title: lesson.title.en,
					description: lesson.en.short,
				};
			},
		},
		data: page('/theories/' + theory.slug, 'lesson'),
	})),
	{ path: 'practices', loadComponent: loadCooking, data: page('/practices', 'practices') },
	{ path: 'about', loadComponent: loadCooking, data: page('/about', 'about') },
	{
		path: 'privacy',
		loadComponent: () =>
			import('./pages/privacy/privacy.component').then((m) => m.PrivacyComponent),
		data: page('/privacy', 'privacy'),
	},
	{
		path: 'licenses',
		loadComponent: () =>
			import('./pages/cooking/credits.component').then((m) => m.CreditsComponent),
		data: page('/licenses', 'licenses'),
	},
	{
		path: 'sign-in',
		loadComponent: () =>
			import('./pages/sign-in/sign-in.component').then((m) => m.SignInComponent),
		data: {
			meta: { ...buildRouteMeta(companyProfile, '/sign-in'), robots: 'noindex, nofollow' },
		},
	},
	{
		path: 'profile',
		loadComponent: () =>
			import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
		data: {
			meta: { ...buildRouteMeta(companyProfile, '/profile'), robots: 'noindex, nofollow' },
		},
	},
	{ path: 'dashboard', redirectTo: '', pathMatch: 'full' },
	{ path: 'theory', redirectTo: 'theories', pathMatch: 'full' },
	{ path: 'practice', redirectTo: 'practices', pathMatch: 'full' },
	{
		path: '**',
		loadComponent: loadCooking,
		data: { mode: 'not-found', meta: { title: 'Page not found', robots: 'noindex, follow' } },
	},
];
