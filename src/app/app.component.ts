import { NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CanonicalService, buildCanonicalUrl } from '@wawjs/ngx-default';
import { ThemeService } from '@wawjs/ngx-ui';
import { filter, map, startWith } from 'rxjs';
import { IconComponent } from './components/icon/icon.component';
import { AuthService } from './feature/auth/auth.service';
import { companyProfile } from './feature/company/company.data';
import { TPipe } from './feature/i18n/t.pipe';

@Component({
	selector: 'app-root',
	imports: [NgOptimizedImage, IconComponent, RouterOutlet, RouterLink, TPipe],
	template: ` <div class="ds min-h-dvh bg-bg text-fg">
		<a class="sr-only-focusable fixed left-4 top-4 z-50 ds-btn ds-btn-primary" href="#main">{{
			'Skip to content' | t
		}}</a>
		<header class="cook-header">
			<div class="cook-shell">
				<a class="cook-brand" routerLink="/" [attr.aria-label]="'Cooking home' | t"
					><img ngSrc="/logo.png" width="40" height="40" priority alt="" /><span
						class="brand-name"
						>Cooking</span
					></a
				>
				<nav class="cook-nav" [attr.aria-label]="'Main navigation' | t">
					@for (link of links; track link.path) {
						<a
							[routerLink]="link.path"
							[attr.aria-current]="active(link.path) ? 'page' : null"
							>{{ link.label | t }}</a
						>
					}
				</nav>
				<div class="cook-account">
					<button
						class="ds-btn ds-btn-ghost w-11 p-3!"
						type="button"
						(click)="toggleTheme()"
						[attr.aria-label]="
							(isDark() ? 'Switch to light mode' : 'Switch to dark mode') | t
						"
						[attr.title]="
							(isDark() ? 'Switch to light mode' : 'Switch to dark mode') | t
						"
					>
						<app-icon [name]="isDark() ? 'sun' : 'moon'" /></button
					><a
						class="ds-btn ds-btn-outline"
						[routerLink]="user() && !user()?.isAnonymous ? '/profile' : '/sign-in'"
						>{{ (user() && !user()?.isAnonymous ? 'Profile' : 'Sign in') | t }}</a
					>
				</div>
			</div>
		</header>
		<main id="main" tabindex="-1" class="cook-shell min-h-[70dvh]"><router-outlet /></main>
		<footer class="cook-footer">
			<div class="cook-shell">
				<a routerLink="/" class="brand-name text-fg!">Cooking</a>
				<nav [attr.aria-label]="'Footer' | t">
					<a routerLink="/sign-in" fragment="appearance-title">{{ 'Preferences' | t }}</a
					><a routerLink="/privacy">{{ 'Privacy' | t }}</a
					><a routerLink="/licenses">{{ 'Credits' | t }}</a>
				</nav>
			</div>
		</footer>
	</div>`,
})
export class App {
	private readonly _router = inject(Router);
	private readonly _theme = inject(ThemeService);
	private readonly _auth = inject(AuthService);
	protected readonly user = this._auth.user;
	protected readonly isDark = computed(() => this._theme.mode() === 'dark');
	protected readonly links = [
		{ path: '/theories', label: 'Learn' },
		{ path: '/practices', label: 'Practice' },
		{ path: '/about', label: 'About' },
	];
	private readonly url = toSignal(
		this._router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			startWith(null),
			map(() => this._router.url.split(/[?#]/)[0]),
		),
		{ initialValue: '/' },
	);
	protected active(path: string) {
		return this.url() === path || this.url().startsWith(path + '/');
	}
	protected toggleTheme() {
		this._theme.setMode(this.isDark() ? 'light' : 'dark');
	}
	constructor() {
		inject(CanonicalService).initialize();
		afterNextRender(() => {
			void this._auth.whenReady();
		});
		const meta = inject(Meta);
		const update = () => {
			meta.updateTag({
				property: 'og:url',
				content: buildCanonicalUrl(companyProfile.siteUrl, this._router.url),
			});
			meta.updateTag({
				property: 'og:image:alt',
				content: 'Cooking: learn the art and science of cooking',
			});
			meta.updateTag({
				name: 'twitter:image:alt',
				content: 'Cooking: learn the art and science of cooking',
			});
		};
		update();
		this._router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				takeUntilDestroyed(),
			)
			.subscribe(update);
	}
}
