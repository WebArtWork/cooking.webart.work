import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CardListComponent } from '../../components/card-list/card-list.component';
import { IconComponent } from '../../components/icon/icon.component';
import { TabsComponent } from '../../components/tabs/tabs.component';
import { useQueryTab } from '../../components/tabs/query-tab';
import { I18nService } from '../../feature/i18n/i18n.service';
import { TPipe } from '../../feature/i18n/t.pipe';
import { COURSES } from '../course/course.data';
import { pickText } from '../explore-types';
import { RESTAURANTS } from '../restaurant/restaurant.data';
import { SCHOOLS } from '../school/school.data';
import type { Employee } from './employee.data';

const TABS = [
	{ id: 'info', label: 'Info' },
	{ id: 'restaurants', label: 'Restaurants' },
	{ id: 'schools', label: 'Schools' },
	{ id: 'courses', label: 'Courses' },
] as const;

/**
 * One job listing: tabs on top. The Info tab opens with the employer's logo spot and the role, then the work,
 * the requirements and the offer; the other tabs list the restaurants, schools and courses.
 */
@Component({
	imports: [CardListComponent, IconComponent, TabsComponent, TPipe],
	template: `
		@if (item(); as job) {
			<article class="cook-detail cook-job">
				<app-tabs
					idPrefix="employee"
					label="Job sections"
					[tabs]="tabs"
					[active]="tab.active()"
					(selected)="tab.select($event)"
				/>
				@if (tab.active() === 'info') {
					<header class="cook-job-head">
						<div class="cook-illustration cook-illustration-square" role="img" [attr.aria-label]="'Illustration placeholder' | t">
							<app-icon name="users" />
						</div>
						<div>
							<h1>{{ job.name }}</h1>
							<p class="cook-card-meta">{{ job.employer }} · {{ text(job.type) }}</p>
						</div>
					</header>
				} @else {
					<h1 class="sr-only">{{ job.name }}</h1>
				}
				@switch (tab.active()) {
					@case ('info') {
						<div role="tabpanel" id="employee-panel-info" aria-labelledby="employee-tab-info" class="cook-panel">
							<section>
								<h2>{{ 'About the role' | t }}</h2>
								<p>{{ text(job.about) }}</p>
							</section>
							<div class="cook-job-columns">
								<section>
									<h2>{{ 'Responsibilities' | t }}</h2>
									<ul class="cook-bullets">
										@for (line of job.responsibilities; track line.en) {
											<li>{{ text(line) }}</li>
										}
									</ul>
								</section>
								<section>
									<h2>{{ 'Requirements' | t }}</h2>
									<ul class="cook-bullets">
										@for (line of job.requirements; track line.en) {
											<li>{{ text(line) }}</li>
										}
									</ul>
								</section>
							</div>
							<aside class="cook-callout">
								<h2>{{ 'What we offer' | t }}</h2>
								<p>{{ text(job.offer) }}</p>
							</aside>
						</div>
					}
					@case ('restaurants') {
						<div role="tabpanel" id="employee-panel-restaurants" aria-labelledby="employee-tab-restaurants" class="cook-panel">
							<app-card-list [items]="restaurants" kind="restaurant" icon="rank-soup" />
						</div>
					}
					@case ('schools') {
						<div role="tabpanel" id="employee-panel-schools" aria-labelledby="employee-tab-schools" class="cook-panel">
							<app-card-list [items]="schools" kind="school" icon="study" />
						</div>
					}
					@case ('courses') {
						<div role="tabpanel" id="employee-panel-courses" aria-labelledby="employee-tab-courses" class="cook-panel">
							<app-card-list [items]="courses" kind="course" icon="play" />
						</div>
					}
				}
			</article>
		} @else {
			<section class="cook-page">
				<h1>{{ 'Page not found' | t }}</h1>
			</section>
		}
	`,
})
export class EmployeeComponent {
	private readonly language = inject(I18nService).language;
	private readonly route = inject(ActivatedRoute);
	private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
	protected readonly tabs = TABS;
	protected readonly tab = useQueryTab(TABS);
	protected readonly restaurants = RESTAURANTS;
	protected readonly schools = SCHOOLS;
	protected readonly courses = COURSES;
	protected readonly item = computed(() => this.data()['item'] as Employee | undefined);
	protected text = (value: Parameters<typeof pickText>[0]) => pickText(value, this.language());
}
