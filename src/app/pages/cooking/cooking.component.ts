import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TPipe } from '../../feature/i18n/t.pipe';

/** Cooking's public introduction and curriculum preview. Lessons will be imported separately. */
@Component({
	imports: [RouterLink, NgOptimizedImage, TPipe],
	templateUrl: './cooking.component.html',
})
export class CookingComponent {
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
