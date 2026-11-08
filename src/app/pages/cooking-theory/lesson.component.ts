import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { COOKING_THEORIES, CookingTheory, localize } from '../../feature/cooking/theories';
import { CookingStudyService } from '../../feature/cooking/study.service';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { CookingTextComponent } from './text.component';

@Component({
	imports: [RouterLink, TPipe, CookingTextComponent],
	templateUrl: './lesson.component.html',
})
export class CookingLessonComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly language = inject(I18nService).language;
	protected readonly study = inject(CookingStudyService);
	protected readonly pick = localize;
	protected readonly theory = computed(() => this.data()['theory'] as CookingTheory);
	// Expansion belongs to a lesson. Moving to a related lesson starts with its short version.
	private readonly expandedSlug = signal<string | null>(null);
	protected readonly expanded = computed(() => this.expandedSlug() === this.theory().slug);
	protected readonly body = computed(() =>
		this.language() === 'ua' ? this.theory().ua : this.theory().en,
	);
	protected readonly related = computed(() =>
		this.theory().related.map((id) => COOKING_THEORIES[id - 1]),
	);
	protected readonly previous = computed(() => COOKING_THEORIES[this.theory().id - 2]);
	protected readonly next = computed(() => COOKING_THEORIES[this.theory().id]);
	protected readonly studied = computed(() => this.study.marked().includes(this.theory().slug));
	protected toggle() {
		this.expandedSlug.set(this.expanded() ? null : this.theory().slug);
	}
	protected print() {
		window.print();
	}
}
