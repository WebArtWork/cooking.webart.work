import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { buildRouteMeta } from '@wawjs/ngx-default';
import { companyProfile } from './feature/company/company.data';
import { EXERCISE_LOADERS } from './feature/cooking/exercise.loaders';

/** Practice: the list at /practices and one session per theory at /practices/<theory>. Loaded as a group. */
export const PRACTICE_ROUTES: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: () =>
			import('./pages/cooking-practice/practice-list.component').then((m) => m.PracticeListComponent),
		data: { meta: buildRouteMeta(companyProfile, '/practices') },
	},
	{
		path: ':slug',
		loadComponent: () =>
			import('./pages/cooking-practice/practice-session.component').then((m) => m.PracticeSessionComponent),
		resolve: {
			exercises: (route: ActivatedRouteSnapshot) => {
				const load = EXERCISE_LOADERS[route.paramMap.get('slug') ?? ''];
				return load ? load().then((m) => m.default) : undefined;
			},
			meta: (route: ActivatedRouteSnapshot) => ({
				...buildRouteMeta(companyProfile, '/practices/' + route.paramMap.get('slug')),
				title: 'Practice',
				robots: 'noindex, follow',
			}),
		},
		data: { meta: buildRouteMeta(companyProfile, '/practices') },
	},
];
