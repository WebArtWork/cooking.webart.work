import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { buildRouteMeta } from '@wawjs/ngx-default';
import { companyProfile } from './feature/company/company.data';
import cookingRoutes from '../data/cooking/routes.json';
import { COOKING_LOADERS } from './feature/cooking/theory.loaders';
import { GlossaryService } from './feature/glossary/glossary.service';
import type { CookingTheory } from './feature/cooking/theories';
const loadCooking = () =>
	import('./pages/cooking/cooking.component').then((m) => m.CookingComponent);
const page = (path: string, mode: string) => ({ mode, meta: buildRouteMeta(companyProfile, path) });
export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: loadCooking,
		resolve: { glossary: () => inject(GlossaryService).load() },
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
	...cookingRoutes.map((theory) => ({
		path: 'theories/' + theory.slug,
		loadComponent: () =>
			import('./pages/cooking-theory/lesson.component').then((m) => m.CookingLessonComponent),
		resolve: {
			glossary: () => inject(GlossaryService).load(),
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
	{
		path: 'glossary',
		loadComponent: () => import('./pages/cooking-glossary/glossary.component').then((m) => m.GlossaryComponent),
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/glossary'),
				title: 'Cooking glossary',
				description: '289 kitchen words and what they mean, from active time and doneness to emulsion and the Maillard reaction, in English and Ukrainian.',
			},
		},
	},
	// world recipes: the list, and one page per recipe whose text loads when it opens
	{
		path: 'recipes',
		loadComponent: () => import('./pages/recipes/recipes.component').then((m) => m.RecipesComponent),
		data: {
			meta: {
				...buildRouteMeta(companyProfile, '/recipes'),
				title: 'World recipes',
				description: 'More than 1,400 dishes from around the world, with ingredients, steps and times, in English and Ukrainian.',
			},
		},
	},
	{
		path: 'recipes/:slug',
		loadComponent: () => import('./pages/recipes/recipe-detail.component').then((m) => m.RecipeDetailComponent),
		resolve: {
			recipe: (route: ActivatedRouteSnapshot) =>
				import('./pages/recipes/world-recipes.data').then((m) => m.loadWorldRecipe(route.paramMap.get('slug') ?? '')),
			meta: async (route: ActivatedRouteSnapshot) => {
				const slug = route.paramMap.get('slug') ?? '';
				const row = (await import('./pages/recipes/world-recipes.data')).worldRecipeRow(slug);
				return {
					...buildRouteMeta(companyProfile, '/recipes/' + slug),
					title: row?.title.en ?? 'Page not found',
					...(row ? {} : { robots: 'noindex, follow' }),
				};
			},
		},
		data: { meta: buildRouteMeta(companyProfile, '/recipes') },
	},
	// practice: the list and one session per theory, loaded as a group
	{ path: 'practices', loadChildren: () => import('./practice.routes').then((m) => m.PRACTICE_ROUTES) },
	{
		path: 'explore',
		loadComponent: () =>
			import('./pages/cooking-explore/explore.component').then((m) => m.CookingExploreComponent),
		data: page('/explore', 'explore'),
	},
	{ path: 'about', redirectTo: 'explore', pathMatch: 'full' },
	{
		path: 'cook/recipe',
		loadComponent: () => import('./pages/cook/recipe-builder.component').then((m) => m.RecipeBuilderComponent),
		// a form the author fills in: not for search results
		data: { meta: { ...buildRouteMeta(companyProfile, '/cook'), title: 'New recipe', robots: 'noindex, follow' } },
	},
	{
		path: 'cook',
		loadComponent: () => import('./pages/cook/cook.component').then((m) => m.CookComponent),
		// empty for now, so it stays out of search results
		data: { meta: { ...buildRouteMeta(companyProfile, '/cook'), title: 'Cook', robots: 'noindex, follow' } },
	},
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
	// the pages that the cards of Explore open, loaded as a group
	{ path: '', loadChildren: () => import('./explore.routes').then((m) => m.EXPLORE_ROUTES) },
	{
		path: '**',
		loadComponent: loadCooking,
		data: { mode: 'not-found', meta: { title: 'Page not found', robots: 'noindex, follow' } },
	},
];
