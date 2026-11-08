import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
	{ path: 'theories/print/:version', renderMode: RenderMode.Client },
	{ path: 'profile', renderMode: RenderMode.Client },
	{ path: 'sign-in', renderMode: RenderMode.Client },
	{ path: '**', renderMode: RenderMode.Prerender },
];
