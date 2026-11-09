import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { pickText, type ExploreCard } from '../../pages/explore-types';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.data';

/**
 * Cards that open their own pages (/<kind>/<slug>): a picture spot, the name, a short line and a summary.
 * Used by Explore and by the tabs of the detail pages, so the same list looks the same everywhere.
 */
@Component({
	selector: 'app-card-list',
	imports: [IconComponent, RouterLink, TPipe],
	template: `
		@if (items().length) {
			<ul class="cook-card-grid">
				@for (item of items(); track item.slug) {
					<li>
						<a class="cook-card" [routerLink]="['/' + kind(), item.slug]">
							<div class="cook-illustration" role="img" [attr.aria-label]="'Illustration placeholder' | t">
								<app-icon [name]="icon()" />
							</div>
							<h2>{{ item.name }}</h2>
							<p class="cook-card-meta">{{ text(item.meta) }}</p>
							<p>{{ text(item.text) }}</p>
						</a>
					</li>
				}
			</ul>
		} @else {
			<p class="cook-card-meta">{{ 'Nothing here yet.' | t }}</p>
		}
	`,
})
export class CardListComponent {
	private readonly language = inject(I18nService).language;
	readonly items = input.required<readonly ExploreCard[]>();
	/** The page kind in the address: restaurant, recipe, chef, school, course or employee. */
	readonly kind = input.required<string>();
	readonly icon = input.required<IconName>();
	protected readonly ua = computed(() => this.language() === 'ua');
	protected text = (value: Parameters<typeof pickText>[0]) => pickText(value, this.language());
}
