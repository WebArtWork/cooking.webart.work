import { Component, inject } from '@angular/core';
import { LoadingService } from '../../feature/loading/loading.service';
import { TPipe } from '../../feature/i18n/t.pipe';

/**
 * The full-screen spinner: on top of everything from the first paint, while the session is restored or a
 * slow step runs. It is part of the prerendered page too, so nothing flashes before the app is ready.
 */
@Component({
	selector: 'app-splash',
	imports: [TPipe],
	template: `
		@if (loading.visible()) {
			<div
				class="splash fixed inset-0 z-[100] grid place-items-center bg-bg"
				role="status"
				aria-live="polite"
			>
				<div class="flex flex-col items-center gap-5">
					<img class="size-16 rounded-2xl" src="/logo.png" width="64" height="64" alt="" />
					<span class="spinner" aria-hidden="true"></span>
					<span class="sr-only">{{ 'Loading' | t }}</span>
				</div>
			</div>
		}
	`,
})
export class SplashComponent {
	protected readonly loading = inject(LoadingService);
}
