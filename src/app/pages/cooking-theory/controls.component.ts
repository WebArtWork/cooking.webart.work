import { Component, inject } from '@angular/core';
import { CookingCatalogFilters } from '../../feature/cooking/catalog-filters.service';
import { catalogResults } from '../../feature/cooking/catalog-results';
import { CookingPrintService } from '../../feature/cooking/print.service';
import { COOKING_GROUPS, localize } from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';

/** Search, topic filter, result count and print links of the theories list. */
@Component({
	selector: 'app-cooking-controls',
	imports: [TPipe],
	template: `
		<div class="cooking-search">
			<label
				><span>{{ 'Search lessons' | t }}</span
				><input
					class="ds-input"
					type="search"
					[value]="filters.query()"
					[placeholder]="'Title, number or keyword' | t"
					(input)="filters.updateQuery($any($event.target).value)"
			/></label>
			<label
				><span>{{ 'Topic' | t }}</span
				><select
					class="ds-input"
					[value]="filters.group()"
					(change)="filters.updateGroup($any($event.target).value)"
				>
					<option value="">{{ 'All topics' | t }}</option>
					@for (item of groups; track item.id) {
						<option [value]="item.id">{{ pick(item.title, language()) }}</option>
					}
				</select></label
			>
		</div>
		<div class="cooking-list-tools">
			<p role="status">{{ '{count} of 288 lessons' | t: { count: count() } }}</p>
			<button class="ds-btn ds-btn-outline" type="button" (click)="printing.openPicker()">
				{{ 'Print theories' | t }}
			</button>
		</div>
	`,
})
export class CookingControlsComponent {
	protected readonly filters = inject(CookingCatalogFilters);
	protected readonly printing = inject(CookingPrintService);
	protected readonly language = inject(I18nService).language;
	protected readonly count = catalogResults(this.filters).count;
	protected readonly groups = COOKING_GROUPS;
	protected readonly pick = localize;
}
