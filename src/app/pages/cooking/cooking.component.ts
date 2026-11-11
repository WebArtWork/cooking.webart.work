import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { CookingTextComponent } from '../cooking-theory/text.component';

/** Cooking's public introduction and curriculum preview. Lessons will be imported separately. */
@Component({
	imports: [RouterLink, NgOptimizedImage, TPipe, CookingTextComponent],
	templateUrl: './cooking.component.html',
})
export class CookingComponent {
	private readonly _language = inject(I18nService).language;
	/** A sentence whose kitchen terms become blue words; the same recipe line in both languages. */
	protected readonly glossarySample = computed(() =>
		this._language() === 'ua'
			? 'Варіть соус, поки він покриває зворотний бік ложки, і не перегрівайте його: надто сильний жар руйнує емульсію та запускає зсідання білка.'
			: 'Simmer the sauce until it coats the back of a spoon, and watch the temperature: too much heat breaks an emulsion and makes protein coagulation start.',
	);

	protected readonly mode = inject(ActivatedRoute).snapshot.data['mode'] as string;
	protected readonly topics = [
		{
			number: '01',
			title: 'Kitchen foundations',
			text: 'Organization, equipment and knife skills.',
		},
		{
			number: '02',
			title: 'Heat and technique',
			text: 'Roasting, sautéing, steaming and the science behind them.',
		},
		{
			number: '03',
			title: 'Ingredients and flavor',
			text: 'Preparation, substitutions and balanced combinations.',
		},
		{
			number: '04',
			title: 'Baking essentials',
			text: 'Doughs, batters, measurement and texture.',
		},
		{
			number: '05',
			title: 'Nutrition and food safety',
			text: 'Understanding ingredients and responsible kitchen habits.',
		},
		{
			number: '06',
			title: 'Recipes and cuisines',
			text: 'Explore different traditions and develop your own dishes.',
		},
	];
}
