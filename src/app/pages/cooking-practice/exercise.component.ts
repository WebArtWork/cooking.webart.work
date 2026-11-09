import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { type Answer, type Choice, emptyAnswer, type Exercise, grade, isComplete, shuffled } from '../../feature/cooking/exercise';
import type { Localized } from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';

const TYPE_LABELS: Record<Exercise['type'], string> = {
	single_choice: 'Single choice',
	multiple_choice: 'Select all that apply',
	true_false: 'True or false',
	sequence: 'Put in order',
	matching: 'Match the pairs',
	calculation: 'Calculation',
	find_mistake: 'Find the mistake',
	decision_scenario: 'What would you do?',
};

/**
 * One exercise of any of the eight types: it shows the question and the way to answer, checks the answer, and
 * explains. The parent records the result and moves on. Options are shuffled the same way every time.
 */
@Component({
	selector: 'app-exercise',
	imports: [TPipe],
	template: `
		@let ex = exercise();
		<article class="cook-exercise" [attr.aria-labelledby]="'question-' + ex.id">
			<div class="cook-exercise-tags">
				<span>{{ typeLabel() | t }}</span>
				@if (ex.safetyCritical) {
					<span class="cook-exercise-safety">{{ 'Safety' | t }}</span>
				}
			</div>
			<h2 [id]="'question-' + ex.id">{{ text(ex.question) }}</h2>

			@switch (ex.type) {
				@case ('multiple_choice') {
					<fieldset class="cook-choices" [disabled]="checked()">
						<legend class="sr-only">{{ text(ex.question) }}</legend>
						@for (option of options(); track option.id) {
							<label class="cook-choice" [class.is-selected]="has(option.id)" [class.is-correct]="checked() && isKey(option.id)" [class.is-wrong]="checked() && has(option.id) && !isKey(option.id)">
								<input type="checkbox" [checked]="has(option.id)" (change)="toggle(option.id, $any($event.target).checked)" />
								<span>{{ text(option.text) }}</span>
							</label>
						}
					</fieldset>
				}
				@case ('true_false') {
					<fieldset class="cook-choices" [disabled]="checked()">
						<legend class="sr-only">{{ text(ex.question) }}</legend>
						@for (flag of [true, false]; track flag) {
							<label class="cook-choice" [class.is-selected]="answer().flag === flag" [class.is-correct]="checked() && ex.answer.value === flag" [class.is-wrong]="checked() && answer().flag === flag && ex.answer.value !== flag">
								<input type="radio" [name]="ex.id" [checked]="answer().flag === flag" (change)="setFlag(flag)" />
								<span>{{ (flag ? 'True' : 'False') | t }}</span>
							</label>
						}
					</fieldset>
				}
				@case ('sequence') {
					<ol class="cook-sequence">
						@for (step of orderedSteps(); track step.id; let i = $index; let first = $first; let last = $last) {
							<li>
								<span class="cook-sequence-number" aria-hidden="true">{{ i + 1 }}</span>
								<span class="cook-sequence-text">{{ text(step.text) }}</span>
								<span class="cook-sequence-move">
									<button type="button" [disabled]="checked() || first" [attr.aria-label]="('Move up' | t) + ': ' + text(step.text)" (click)="move(i, -1)">↑</button>
									<button type="button" [disabled]="checked() || last" [attr.aria-label]="('Move down' | t) + ': ' + text(step.text)" (click)="move(i, 1)">↓</button>
								</span>
							</li>
						}
					</ol>
				}
				@case ('matching') {
					<ul class="cook-matching">
						@for (left of ex.leftItems; track left.id) {
							<li>
								<label [for]="'match-' + left.id + ex.id">{{ text(left.text) }}</label>
								<select [id]="'match-' + left.id + ex.id" [disabled]="checked()" [class.is-correct]="checked() && pairIsRight(left.id)" [class.is-wrong]="checked() && !pairIsRight(left.id)" (change)="setPair(left.id, $any($event.target).value)">
									<option value="" [selected]="!answer().pairs[left.id]">{{ 'Choose…' | t }}</option>
									@for (right of rights(); track right.id) {
										<option [value]="right.id" [selected]="answer().pairs[left.id] === right.id" [disabled]="usedElsewhere(left.id, right.id)">{{ text(right.text) }}</option>
									}
								</select>
							</li>
						}
					</ul>
				}
				@case ('calculation') {
					<div class="cook-number-field">
						<label class="sr-only" [for]="'number-' + ex.id">{{ 'Your answer' | t }}</label>
						<input
							[id]="'number-' + ex.id"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							[value]="answer().number"
							[disabled]="checked()"
							[class.is-correct]="checked() && correct()"
							[class.is-wrong]="checked() && !correct()"
							(input)="setNumber($any($event.target).value)"
							(keydown.enter)="check()"
						/>
						<span>{{ text(ex.numericInput!.unitLabel) }}</span>
					</div>
				}
				@default {
					<fieldset class="cook-choices" [disabled]="checked()">
						<legend class="sr-only">{{ text(ex.question) }}</legend>
						@for (option of options(); track option.id) {
							<label class="cook-choice" [class.is-selected]="has(option.id)" [class.is-correct]="checked() && isKey(option.id)" [class.is-wrong]="checked() && has(option.id) && !isKey(option.id)">
								<input type="radio" [name]="ex.id" [checked]="has(option.id)" (change)="pickOne(option.id)" />
								<span>{{ text(option.text) }}</span>
							</label>
						}
					</fieldset>
				}
			}

			@if (checked()) {
				<div class="cook-feedback" [class.is-correct]="correct()" [class.is-wrong]="!correct()" role="status">
					<strong>{{ (correct() ? 'Correct' : 'Not quite') | t }}</strong>
					@if (!correct()) {
						<p>{{ 'Correct answer' | t }}: {{ keyText() }}</p>
					}
					<p>{{ text(ex.explanation) }}</p>
				</div>
				<div class="cook-exercise-actions">
					<button class="ds-btn ds-btn-primary" type="button" (click)="next.emit()">{{ nextLabel() | t }}</button>
				</div>
			} @else {
				<div class="cook-exercise-actions">
					<button class="ds-btn ds-btn-primary" type="button" [disabled]="!complete()" (click)="check()">{{ 'Check' | t }}</button>
				</div>
			}
		</article>
	`,
})
export class ExerciseComponent {
	private readonly language = inject(I18nService).language;
	readonly exercise = input.required<Exercise>();
	/** The label of the button after the answer: "Next" or "Finish". */
	readonly nextLabel = input('Next');
	readonly answered = output<boolean>();
	readonly next = output<void>();

	protected readonly answer = linkedSignal<Exercise, Answer>({
		source: this.exercise,
		computation: (ex) => {
			const answer = emptyAnswer();
			if (ex.type === 'sequence') {
				let order = shuffled(ex.steps?.map((s) => s.id) ?? [], ex.id);
				// never start with the right order
				if (order.every((id, i) => id === ex.answer.order?.[i])) order = [...order.slice(1), order[0]];
				answer.order = order;
			}
			return answer;
		},
	});
	protected readonly checked = linkedSignal<Exercise, boolean>({ source: this.exercise, computation: () => false });
	protected readonly correct = computed(() => grade(this.exercise(), this.answer()));
	protected readonly complete = computed(() => isComplete(this.exercise(), this.answer()));
	protected readonly typeLabel = computed(() => TYPE_LABELS[this.exercise().type]);
	protected readonly options = computed(() => shuffled(this.exercise().options ?? [], this.exercise().id));
	protected readonly rights = computed(() => shuffled(this.exercise().rightItems ?? [], this.exercise().id + 'r'));
	protected readonly orderedSteps = computed(() => {
		const steps = this.exercise().steps ?? [];
		return this.answer().order.flatMap((id) => steps.filter((s) => s.id === id));
	});

	protected text(value: Localized) {
		return this.language() === 'ua' ? value.ua : value.en;
	}
	protected has(id: string) {
		return this.answer().picked.includes(id);
	}
	protected isKey(id: string) {
		return !!this.exercise().answer.optionIds?.includes(id);
	}
	protected pickOne(id: string) {
		this.answer.update((a) => ({ ...a, picked: [id] }));
	}
	protected toggle(id: string, on: boolean) {
		this.answer.update((a) => ({ ...a, picked: on ? [...a.picked, id] : a.picked.filter((x) => x !== id) }));
	}
	protected setFlag(flag: boolean) {
		this.answer.update((a) => ({ ...a, flag }));
	}
	protected setNumber(number: string) {
		this.answer.update((a) => ({ ...a, number }));
	}
	protected move(index: number, by: number) {
		this.answer.update((a) => {
			const order = [...a.order];
			[order[index], order[index + by]] = [order[index + by], order[index]];
			return { ...a, order };
		});
	}
	protected setPair(leftId: string, rightId: string) {
		this.answer.update((a) => {
			const pairs = { ...a.pairs };
			if (rightId) pairs[leftId] = rightId;
			else delete pairs[leftId];
			return { ...a, pairs };
		});
	}
	/** A right item already taken by another left item cannot be chosen again. */
	protected usedElsewhere(leftId: string, rightId: string) {
		return Object.entries(this.answer().pairs).some(([left, right]) => left !== leftId && right === rightId);
	}
	protected pairIsRight(leftId: string) {
		return this.exercise().answer.pairs?.some((p) => p.leftId === leftId && p.rightId === this.answer().pairs[leftId]) ?? false;
	}

	protected check() {
		if (this.checked() || !this.complete()) return;
		this.checked.set(true);
		this.answered.emit(this.correct());
	}

	/** The right answer in words, shown when the learner got it wrong. */
	protected keyText(): string {
		const ex = this.exercise();
		const pick = (list: Choice[] | undefined, id: string) => {
			const item = list?.find((c) => c.id === id);
			return item ? this.text(item.text) : id;
		};
		switch (ex.type) {
			case 'true_false':
				return this.language() === 'ua' ? (ex.answer.value ? 'Правда' : 'Неправда') : ex.answer.value ? 'True' : 'False';
			case 'sequence':
				return (ex.answer.order ?? []).map((id, i) => `${i + 1}. ${pick(ex.steps, id)}`).join('; ');
			case 'matching':
				return (ex.answer.pairs ?? []).map((p) => `${pick(ex.leftItems, p.leftId)} → ${pick(ex.rightItems, p.rightId)}`).join('; ');
			case 'calculation':
				return `${ex.answer.value} ${this.text(ex.numericInput!.unitLabel)}`;
			default:
				return (ex.answer.optionIds ?? []).map((id) => pick(ex.options, id)).join('; ');
		}
	}
}
