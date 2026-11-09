import { NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CanonicalService, buildCanonicalUrl } from '@wawjs/ngx-default';
import { filter, map, startWith } from 'rxjs';
import { IconComponent } from './components/icon/icon.component';
import type { IconName } from './components/icon/icon.data';
import { AuthService } from './feature/auth/auth.service';
import { companyProfile } from './feature/company/company.data';
import { TPipe } from './feature/i18n/t.pipe';
import { LoadingService } from './feature/loading/loading.service';
import { SplashComponent } from './components/splash/splash.component';
import { CookingPrintService } from './feature/cooking/print.service';
import { CookingPrintLessonsComponent } from './pages/cooking-theory/print-lessons.component';
import { CookingPointsService } from './feature/cooking/points.service';
import { CookingControlsComponent } from './pages/cooking-theory/controls.component';
import { CookingCatalogFilters } from './feature/cooking/catalog-filters.service';

/** The pages that the cards of Explore open. */
const EXPLORE_PAGES = ['/restaurant', '/recipe', '/chef', '/school', '/course', '/employee'];

/** Longest the splash screen waits for the session. */
const SPLASH_LIMIT_MS = 8000;

@Component({
	selector: 'app-root',
	imports: [NgOptimizedImage, IconComponent, RouterOutlet, RouterLink, TPipe, CookingControlsComponent, CookingPrintLessonsComponent, SplashComponent],
	template: ` <div class="ds min-h-dvh bg-bg text-fg" [class.cook-printing]="!!printing.job()">
		<a class="sr-only-focusable fixed left-4 top-4 z-50 ds-btn ds-btn-primary" href="#main">{{
			'Skip to content' | t
		}}</a>
		<header class="cook-header">
			<div class="cook-shell">
				<a
					class="cook-brand"
					[class.cook-brand-compact]="theories()"
					routerLink="/"
					[attr.aria-label]="'Cooking home' | t"
					><img ngSrc="/logo.png" width="40" height="40" priority alt="" /><span
						class="brand-name"
						[class.cook-hide-mobile]="theories()"
						>Cooking</span
					></a
				>
				@if (theories()) {
					<span class="cook-pagename">{{ 'Theories' | t }}</span>
				}
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
					@if (lessonSlug(); as slug) {
						<button
							class="ds-btn ds-btn-ghost cook-print-btn"
							type="button"
							[disabled]="printing.preparing()"
							[attr.aria-label]="'Print theory' | t"
							[attr.title]="'Print theory' | t"
							(click)="printLesson(slug)"
						>
							<app-icon name="print" />
						</button>
					}
					@if (theories()) {
						<button
							class="ds-btn ds-btn-ghost cook-filter-btn"
							type="button"
							[attr.aria-label]="'Print' | t"
							[attr.title]="'Print' | t"
							(click)="openPrint()"
						>
							<app-icon name="print" />
						</button>
						<button
							class="ds-btn ds-btn-ghost cook-filter-btn"
							type="button"
							[class.is-active]="filters.active()"
							[attr.aria-expanded]="filters.panelOpen()"
							aria-controls="cook-filter-panel"
							[attr.aria-label]="'Filters' | t"
							[attr.title]="'Filters' | t"
							(click)="filters.panelOpen.set(!filters.panelOpen())"
						>
							<app-icon name="filter" />
						</button>
					}
					<a
						class="cook-points"
						routerLink="/profile"
						[attr.aria-label]="
							('Cooking points' | t) +
							': ' +
							('{points} points' | t: { points: level().points }) +
							', ' +
							(level().rank.name | t)
						"
						[attr.title]="level().rank.name | t"
						><app-icon [name]="level().rank.icon" /><span>{{ level().points }}</span></a
					>
					<a
						class="ds-btn ds-btn-outline"
						[routerLink]="user() && !user()?.isAnonymous ? '/profile' : '/sign-in'"
						[attr.aria-label]="(user() && !user()?.isAnonymous ? 'Profile' : 'Sign in') | t"
						><app-icon class="cook-account-icon" name="profile" /><span
							class="cook-account-text"
							>{{ (user() && !user()?.isAnonymous ? 'Profile' : 'Sign in') | t }}</span
						></a
					>
				</div>
			</div>
			@if (theories() && filters.panelOpen()) {
				<div class="cook-filter-panel cook-shell" id="cook-filter-panel">
					@defer {
						<app-cooking-controls />
					}
				</div>
			}
		</header>
		<main id="main" tabindex="-1" class="cook-shell min-h-[70dvh]"><router-outlet /></main>
		@if (printing.job(); as job) {
			<div class="cooking-sheet">
				<app-cooking-print-lessons [theories]="job.theories" />
			</div>
		}
		@if (landing()) {
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
		}
		<nav class="cook-tabbar" [attr.aria-label]="'Main navigation' | t">
			<ul>
				@for (link of links; track link.path) {
					<li>
						<a
							[routerLink]="link.path"
							[attr.aria-current]="active(link.path) ? 'page' : null"
							><app-icon [name]="link.icon" /><span>{{ link.label | t }}</span></a
						>
					</li>
				}
			</ul>
		</nav>
		<app-splash />
	</div>`,
})
export class App {
	private readonly _router = inject(Router);
	private readonly _auth = inject(AuthService);
	protected readonly user = this._auth.user;
	protected readonly filters = inject(CookingCatalogFilters);
	protected readonly printing = inject(CookingPrintService);
	protected openPrint() {
		this.filters.panelOpen.set(false);
		void this.printing.openPicker();
	}
	private readonly _points = inject(CookingPointsService);
	protected readonly level = computed(() => ({
		...this._points.level(),
		points: this._points.points(),
	}));
	protected readonly links: { path: string; label: string; icon: IconName }[] = [
		{ path: '/theories', label: 'Learn', icon: 'study' },
		{ path: '/practices', label: 'Practice', icon: 'play' },
		{ path: '/explore', label: 'Explore', icon: 'compass' },
		{ path: '/cook', label: 'Cook', icon: 'rank-soup' },
	];
	private readonly url = toSignal(
		this._router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			startWith(null),
			map(() => this._router.url.split(/[?#]/)[0]),
		),
		{ initialValue: '/' },
	);
	protected readonly theories = computed(() => this.url() === '/theories');
	/** The lesson on screen, when the page is a lesson. */
	protected readonly lessonSlug = computed(() => {
		const match = /^\/theories\/([^/]+)$/.exec(this.url());
		return match ? match[1] : null;
	});
	protected printLesson(slug: string) {
		void this.printing.print([slug]);
	}
	protected readonly landing = computed(() => this.url() === '/');
	protected active(path: string) {
		// the Explore tab also covers the pages its cards open
		const paths = path === '/explore' ? [path, ...EXPLORE_PAGES] : [path];
		return paths.some((p) => this.url() === p || this.url().startsWith(p + '/'));
	}
	constructor() {
		inject(CanonicalService).initialize();
		effect(() => {
			if (!this.theories()) this.filters.panelOpen.set(false);
		});
		const loading = inject(LoadingService);
		afterNextRender(() => {
			// the splash screen waits for the session, but never longer than a few seconds
			void Promise.race([
				this._auth.whenReady(),
				new Promise<void>((resolve) => setTimeout(resolve, SPLASH_LIMIT_MS)),
			]).finally(() => loading.bootDone());
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
