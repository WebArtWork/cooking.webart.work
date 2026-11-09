import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import exerciseIndex from '../../../data/cooking/exercise-index.json';
import { CookingPracticeService } from '../../feature/cooking/practice.service';
import { COOKING_GROUPS, COOKING_THEORIES, localize } from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';

const COUNTS = new Map(exerciseIndex.map((entry) => [entry.id, entry]));
const TOTAL = exerciseIndex.reduce((sum, entry) => sum + entry.count, 0);

/** Practice: every topic with its theories, how many exercises each has, and how far you got. */
@Component({
	imports: [RouterLink, TPipe],
	template: `
		<section class="cook-page cook-practice-list" aria-labelledby="practice-list-title">
			<h1 id="practice-list-title">{{ 'Practice' | t }}</h1>
			<p>{{ '{correct} of {total} exercises answered correctly' | t: { correct: practice.correctCount(), total: total } }}</p>
			@for (group of groups(); track group.id; let first = $first) {
				<details class="cooking-topic" [open]="first">
					<summary>
						<span>{{ pick(group.title) }}</span>
						<span class="cooking-topic-count">{{ group.exercises }}</span>
					</summary>
					<ol class="cooking-lesson-list">
						@for (item of group.items; track item.id) {
							<li>
								<span class="cook-number">{{ item.id }}</span>
								<div>
									<h2>
										<a [routerLink]="['/practices', item.slug]">{{ pick(item.title) }}</a>
									</h2>
									<p>
										{{ '{count} exercise|{count} exercises' | t: { count: item.count } }}
										@if (item.progress.answered) {
											· {{ '{correct} of {total} correct' | t: { correct: item.progress.correct, total: item.count } }}
										}
										@if (item.safety) {
											<span class="cook-exercise-safety">{{ 'Safety' | t }}</span>
										}
									</p>
								</div>
							</li>
						}
					</ol>
				</details>
			}
		</section>
	`,
})
export class PracticeListComponent {
	protected readonly practice = inject(CookingPracticeService);
	private readonly language = inject(I18nService).language;
	protected readonly total = TOTAL;
	protected pick = (value: { en: string; ua: string }) => localize(value, this.language());

	protected readonly groups = computed(() => {
		this.practice.results();
		return COOKING_GROUPS.map((group) => {
			const items = COOKING_THEORIES.filter((t) => t.group === group.id).map((t) => {
				const entry = COUNTS.get(t.id);
				return { id: t.id, slug: t.slug, title: t.title, count: entry?.count ?? 0, safety: entry?.safety ?? 0, progress: this.practice.forTheory(t.id) };
			});
			return { ...group, items, exercises: items.reduce((sum, item) => sum + item.count, 0) };
		});
	});
}
