import { inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * The active tab of a page, kept in the address (?tab=menu) so a link can open a given tab. The first tab
 * is the default and leaves the address clean. Call from a field initializer or constructor.
 */
export function useQueryTab<T extends string>(tabs: readonly { id: T }[]) {
	const router = inject(Router);
	const route = inject(ActivatedRoute);
	const fromUrl = (): T => {
		const id = route.snapshot.queryParamMap.get('tab');
		return tabs.find((tab) => tab.id === id)?.id ?? tabs[0].id;
	};
	const active = signal<T>(fromUrl());
	const select = (id: string) => {
		const tab = tabs.find((item) => item.id === id);
		if (!tab) return;
		active.set(tab.id);
		void router.navigate([], {
			relativeTo: route,
			queryParams: { tab: tab.id === tabs[0].id ? null : tab.id },
			replaceUrl: true,
		});
	};
	return { active, select };
}
