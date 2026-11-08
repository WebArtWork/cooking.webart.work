import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
	COOKING_THEORIES,
	CookingTheory,
	loadCookingTheory,
	localize,
} from '../../feature/cooking/theories';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { CookingTextComponent } from './text.component';

@Component({
	imports: [RouterLink, TPipe, CookingTextComponent],
	template: `
		<div class="cooking-print-tools cook-page">
			<h1>{{ (full ? 'Full cooking theories' : 'Short cooking theories') | t }}</h1>
			<p>{{ 'All 330 theories in one printable document.' | t }}</p>
			<div class="cooking-reader-tools">
				<a class="ds-btn ds-btn-outline" routerLink="/theories">{{
					'Back to lessons' | t
				}}</a
				><button
					class="ds-btn ds-btn-primary"
					type="button"
					(click)="print()"
					[disabled]="loading() || !!error()"
				>
					{{ 'Print document' | t }}
				</button>
			</div>
			@if (loading()) {
				<p role="status">{{ 'Loading theories…' | t }}</p>
			}
			@if (error()) {
				<p role="alert">{{ 'Could not load the theories. Try again.' | t }}</p>
				<button class="ds-btn ds-btn-outline" type="button" (click)="load()">
					{{ 'Try again' | t }}
				</button>
			}
		</div>
		@for (theory of theories(); track theory.id) {
			<article class="cook-prose cooking-print-lesson">
				<h2 class="cooking-print-title">
					{{ theory.id }}. {{ pick(theory.title, language()) }}
				</h2>
				@let body = language() === 'ua' ? theory.ua : theory.en;
				<p><app-cooking-text [text]="body.short" /></p>
				@if (full) {
					@for (section of body.sections; track $index) {
						<section>
							<h3>{{ section.title }}</h3>
							<p><app-cooking-text [text]="section.text" /></p>
						</section>
					}
				}
				<section>
					<h3>{{ 'Sources' | t }}</h3>
					<ul>
						@for (source of theory.references; track source) {
							<li>
								<a [href]="source">{{ source }}</a>
							</li>
						}
					</ul>
				</section>
			</article>
		}
	`,
})
export class CookingPrintComponent {
	protected readonly language = inject(I18nService).language;
	protected readonly full = inject(ActivatedRoute).snapshot.data['version'] === 'full';
	protected readonly pick = localize;
	protected readonly theories = signal<CookingTheory[]>([]);
	protected readonly loading = signal(true);
	protected readonly error = signal(false);
	constructor() {
		void this.load();
	}
	protected async load() {
		this.loading.set(true);
		this.error.set(false);
		try {
			this.theories.set(
				await Promise.all(COOKING_THEORIES.map((t) => loadCookingTheory(t.slug))),
			);
		} catch {
			this.error.set(true);
		} finally {
			this.loading.set(false);
		}
	}
	protected print() {
		window.print();
	}
}
