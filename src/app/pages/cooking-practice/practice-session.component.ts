import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Exercise, ExerciseSet } from '../../feature/cooking/exercise';
import { CookingPracticeService } from '../../feature/cooking/practice.service';
import { COOKING_THEORIES, localize } from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { ExerciseComponent } from './exercise.component';

/**
 * Practice for one theory: its exercises one after another, each checked and explained, then a summary with
 * the missed ones to retry. Results are kept on this device (see CookingPracticeService).
 */
@Component({
	imports: [ExerciseComponent, RouterLink, TPipe],
	template: `
		@if (set(); as current) {
			<section class="cook-practice" aria-labelledby="practice-title">
				<header class="cook-practice-head">
					<p class="cook-card-meta">{{ 'Practice' | t }}</p>
					<h1 id="practice-title">{{ title() }}</h1>
					<a class="cook-practice-theory" [routerLink]="['/theories', slug()]">{{ 'Read the theory' | t }}</a>
				</header>

				@if (!finished()) {
					<div class="cook-practice-progress" role="progressbar" [attr.aria-valuemin]="1" [attr.aria-valuemax]="queue().length" [attr.aria-valuenow]="index() + 1" [attr.aria-label]="'Progress' | t">
						<span [style.width.%]="((index() + 1) / queue().length) * 100"></span>
					</div>
					<p class="cook-card-meta">{{ 'Exercise {current} of {total}' | t: { current: index() + 1, total: queue().length } }}</p>
					<app-exercise
						[exercise]="queue()[index()]"
						[nextLabel]="index() + 1 === queue().length ? 'Finish' : 'Next'"
						(answered)="answered($event)"
						(next)="advance()"
					/>
				} @else {
					<div class="cook-practice-summary" role="status">
						<h2>{{ 'Result: {correct} of {total}' | t: { correct: correctCount(), total: queue().length } }}</h2>
						@if (missed().length) {
							<p>{{ 'These need another look:' | t }}</p>
							<ul>
								@for (item of missed(); track item.id) {
									<li>
										{{ text(item.question) }}
										@if (item.safetyCritical) {
											<span class="cook-exercise-safety">{{ 'Safety' | t }}</span>
										}
									</li>
								}
							</ul>
							@if (hasSafetyMiss()) {
								<p>{{ 'Some of these are about food safety. Read the theory again before you cook.' | t }}</p>
							}
						} @else {
							<p>{{ 'Everything correct. Well done.' | t }}</p>
						}
						<div class="cook-exercise-actions">
							@if (missed().length) {
								<button class="ds-btn ds-btn-primary" type="button" (click)="retryMissed()">{{ 'Retry missed' | t }}</button>
							}
							<button class="ds-btn ds-btn-outline" type="button" (click)="restart(current.exercises)">{{ 'Practice again' | t }}</button>
							<a class="ds-btn ds-btn-outline" [routerLink]="['/theories', slug()]">{{ 'Read the theory' | t }}</a>
							@if (nextSlug(); as next) {
								<a class="ds-btn ds-btn-outline" [routerLink]="['/practices', next]">{{ 'Next theory' | t }}</a>
							}
						</div>
					</div>
				}
			</section>
		} @else {
			<section class="cook-page">
				<h1>{{ 'Page not found' | t }}</h1>
			</section>
		}
	`,
})
export class PracticeSessionComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly language = inject(I18nService).language;
	private readonly practice = inject(CookingPracticeService);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly set = computed(() => this.data()['exercises'] as ExerciseSet | undefined);
	protected readonly slug = computed(() => this.route.snapshot.paramMap.get('slug') ?? '');
	private readonly theory = computed(() => COOKING_THEORIES.find((t) => t.slug === this.slug()));
	protected readonly title = computed(() => {
		const theory = this.theory();
		return theory ? `${theory.id}. ${localize(theory.title, this.language())}` : '';
	});
	protected readonly nextSlug = computed(() => {
		const theory = this.theory();
		return theory ? COOKING_THEORIES[theory.id]?.slug : undefined;
	});

	/** The exercises being run now: all of them, or only the missed ones when retrying. */
	protected readonly queue = signal<Exercise[]>(this.set()?.exercises ?? []);
	protected readonly index = signal(0);
	private readonly results = signal<Record<string, boolean>>({});
	protected readonly finished = computed(() => this.index() >= this.queue().length);
	protected readonly correctCount = computed(() => Object.values(this.results()).filter(Boolean).length);
	protected readonly missed = computed(() => this.queue().filter((e) => this.results()[e.id] === false));
	protected readonly hasSafetyMiss = computed(() => this.missed().some((e) => e.safetyCritical));

	protected text(value: { en: string; ua: string }) {
		return this.language() === 'ua' ? value.ua : value.en;
	}

	protected answered(correct: boolean) {
		const exercise = this.queue()[this.index()];
		this.results.update((r) => ({ ...r, [exercise.id]: correct }));
		this.practice.record(exercise.id, correct);
	}

	protected advance() {
		this.index.update((i) => i + 1);
		if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
	}

	protected retryMissed() {
		this.restart(this.missed());
	}

	protected restart(list: Exercise[]) {
		this.queue.set(list);
		this.results.set({});
		this.index.set(0);
		if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
	}
}
