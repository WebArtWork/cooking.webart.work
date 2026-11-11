import { Component, inject, input } from '@angular/core';
// types only: the catalog data stays out of the first bundle
import type { CookingBody, CookingTheory, Localized } from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { CookingTextComponent } from './text.component';

const RELATED_TITLES = ['Related theories', 'Пов’язані теорії'];

/**
 * The theories as plain content for paper: the title and the detailed text. The section that only lists
 * related theories by number is left out, and so are the sources: nothing points to other pages.
 */
@Component({
	selector: 'app-cooking-print-lessons',
	imports: [CookingTextComponent],
	template: `
		@for (theory of theories(); track theory.id) {
			<article class="cook-prose cooking-print-lesson">
				<h2 class="cooking-print-title">
					{{ theory.id }}. {{ pick(theory.title, language()) }}
				</h2>
				@let body = language() === 'ua' ? theory.ua : theory.en;
				@for (section of content(body.sections); track $index) {
					<section>
						<h3>{{ section.title }}</h3>
						<p><app-cooking-text [text]="section.text" [link]="false" /></p>
					</section>
				}
			</article>
		}
	`,
})
export class CookingPrintLessonsComponent {
	readonly theories = input.required<CookingTheory[]>();
	protected readonly language = inject(I18nService).language;
	protected pick(value: Localized, language: string) {
		return language === 'ua' ? value.ua : value.en;
	}
	/** The sections without the list of related theory numbers. */
	protected content(sections: CookingBody['sections']) {
		return sections.filter((section) => !RELATED_TITLES.includes(section.title));
	}
}
