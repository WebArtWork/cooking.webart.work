import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { COOKING_THEORIES, CookingTheory, localize } from '../../feature/cooking/theories';
import exerciseIndex from '../../../data/cooking/exercise-index.json';
import theoryTechniques from '../../../data/cooking/theory-techniques.json';
import { CookingPracticeService } from '../../feature/cooking/practice.service';
import { CookingStudyService } from '../../feature/cooking/study.service';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { CookingTextComponent } from './text.component';

const EXERCISES = new Map(exerciseIndex.map((entry) => [entry.id, entry]));
const TECHNIQUES = theoryTechniques as unknown as Record<string, [string, string, string][]>;
const RELATED_TITLES = ['Related theories', 'Пов’язані теорії'];

@Component({
	imports: [RouterLink, TPipe, CookingTextComponent],
	templateUrl: './lesson.component.html',
})
export class CookingLessonComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly language = inject(I18nService).language;
	protected readonly study = inject(CookingStudyService);
	private readonly practice = inject(CookingPracticeService);
	protected readonly pick = localize;
	protected readonly theory = computed(() => this.data()['theory'] as CookingTheory);
	protected readonly body = computed(() =>
		this.language() === 'ua' ? this.theory().ua : this.theory().en,
	);
	/** The detailed text. The section that only lists related theory numbers is left out: the links are below. */
	protected readonly content = computed(() =>
		this.body().sections.filter((section) => !RELATED_TITLES.includes(section.title)),
	);
	protected readonly related = computed(() =>
		this.theory().related.map((id) => COOKING_THEORIES[id - 1]),
	);
	protected readonly previous = computed(() => COOKING_THEORIES[this.theory().id - 2]);
	protected readonly next = computed(() => COOKING_THEORIES[this.theory().id]);
	/** How many exercises this theory has, and how far the learner got. */
	protected readonly exercises = computed(() => EXERCISES.get(this.theory().id));
	/** The cooking techniques this theory explains: [id, English, Ukrainian]. */
	protected readonly techniques = computed(() => TECHNIQUES[this.theory().id] ?? []);
	protected readonly progress = computed(() => this.practice.forTheory(this.theory().id));
	protected readonly studied = computed(() => this.study.marked().includes(this.theory().slug));
}
