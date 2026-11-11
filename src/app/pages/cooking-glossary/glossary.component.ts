import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import glossary from '../../../data/cooking/glossary.json';

type Language = 'en' | 'ua';
type Text = { en: string; ua: string };

interface Term {
	id: string;
	section: number;
	term: Text;
	def: Text;
}

const SECTIONS = glossary.sections as { id: string; title: Text }[];
/** Imported from content/cooking-glossary by tools/glossary/import-glossary.mjs. */
const TERMS: readonly Term[] = (glossary.terms as unknown as [string, number, string, string, string, string][]).map(
	([id, section, termEn, termUa, defEn, defUa]) => ({ id, section, term: { en: termEn, ua: termUa }, def: { en: defEn, ua: defUa } }),
);

/** Lower case without apostrophes, so "cook's" and "cooks" compare equal. */
const norm = (text: string) => text.toLocaleLowerCase().replace(/[’'ʼ`]/g, '');

/** The Glossary: kitchen words a beginner may not know, in categories, searchable in either language. */
@Component({
	imports: [TPipe],
	template: `
		<section class="cook-page cook-glossary" aria-labelledby="glossary-title">
			<h1 id="glossary-title" class="cooking-head">{{ 'Cooking glossary' | t }}</h1>
			<p class="cooking-head">
				{{ '{count} kitchen words and what they mean, in English and Ukrainian.' | t: { count: total } }}
			</p>

			<div class="cooking-search">
				<label
					><span>{{ 'Search terms' | t }}</span
					><input
						class="ds-input"
						type="search"
						autocomplete="off"
						[value]="query()"
						[placeholder]="'Term or meaning' | t"
						(input)="query.set($any($event.target).value)"
				/></label>
				<label
					><span>{{ 'Category' | t }}</span
					><select class="ds-input" [value]="section()" (change)="section.set($any($event.target).value)">
						<option value="">{{ 'All categories' | t }}</option>
						@for (item of sections; track item.id) {
							<option [value]="item.id">{{ item.title[language()] }}</option>
						}
					</select></label
				>
			</div>
			<p class="cook-card-meta" role="status">{{ '{count} terms' | t: { count: shown() } }}</p>

			@for (group of groups(); track group.id; let first = $first) {
				<details class="cooking-topic" [open]="isOpen(group.id, first)" (toggle)="toggled(group.id, $any($event.target).open)">
					<summary>
						<span>{{ group.title[language()] }}</span
						><span class="cooking-topic-count">{{ group.terms.length }}</span>
					</summary>
					<dl class="cook-glossary-list">
						@for (item of group.terms; track item.id) {
							<div [id]="'term-' + item.id">
								<dt>
									{{ item.term[language()] }}
									@if (language() === 'ua') {
										<span class="cook-glossary-en" lang="en">{{ item.term.en }}</span>
									}
								</dt>
								<dd>{{ item.def[language()] }}</dd>
							</div>
						}
					</dl>
				</details>
			} @empty {
				<div class="ds-card cooking-empty">
					<h2>{{ 'No terms found' | t }}</h2>
					<p>{{ 'Try another word or clear your filters.' | t }}</p>
					<button class="ds-btn ds-btn-primary" type="button" (click)="clear()">{{ 'Clear filters' | t }}</button>
				</div>
			}
		</section>
	`,
})
export class GlossaryComponent {
	protected readonly language = inject(I18nService).language as unknown as () => Language;
	protected readonly sections = SECTIONS;
	protected readonly total = TERMS.length;
	/** A term linked from elsewhere can arrive as ?term= and lands in the search box. */
	protected readonly query = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('term') ?? '');
	protected readonly section = signal('');
	/** The categories the reader opened or closed by hand; null until then (the first one is open). */
	private readonly opened = signal<Record<string, boolean>>({});

	protected readonly groups = computed(() => {
		const needle = norm(this.query().trim());
		const section = this.section();
		return SECTIONS.map((item, index) => ({
			...item,
			terms: TERMS.filter(
				(term) =>
					term.section === index &&
					(!section || item.id === section) &&
					(!needle || norm(term.term.en).includes(needle) || norm(term.term.ua).includes(needle) || norm(term.def[this.language()]).includes(needle)),
			),
		})).filter((item) => item.terms.length);
	});
	protected readonly shown = computed(() => this.groups().reduce((sum, group) => sum + group.terms.length, 0));
	private readonly filtered = computed(() => !!this.query().trim() || !!this.section());

	/** A search or a category shows every match; otherwise the reader's own choice, with the first category open. */
	protected isOpen(id: string, first: boolean) {
		return this.filtered() || (this.opened()[id] ?? first);
	}
	protected toggled(id: string, open: boolean) {
		if (!this.filtered()) this.opened.update((state) => ({ ...state, [id]: open }));
	}
	protected clear() {
		this.query.set('');
		this.section.set('');
	}
}
