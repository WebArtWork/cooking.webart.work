import { Component, ElementRef, inject, input, output } from '@angular/core';
import { TPipe } from '../../feature/i18n/t.pipe';

export interface TabItem {
	id: string;
	/** English label; it is also the translation key. */
	label: string;
}

/**
 * A row of tabs that scrolls sideways when it does not fit: with the mouse wheel, by dragging with the mouse,
 * with the scrollbar or by touch. Arrow keys, Home and End move between the tabs. The parent shows the panel
 * of the active tab, with the id `<idPrefix>-panel-<tab id>`.
 */
@Component({
	selector: 'app-tabs',
	imports: [TPipe],
	template: `
		<div
			class="cook-tabs"
			role="tablist"
			[attr.aria-label]="label() | t"
			(wheel)="wheel($event)"
			(pointerdown)="dragStart($event)"
			(pointermove)="dragMove($event)"
			(pointerup)="dragEnd()"
			(pointercancel)="dragEnd()"
		>
			@for (tab of tabs(); track tab.id) {
				<button
					type="button"
					role="tab"
					[id]="idPrefix() + '-tab-' + tab.id"
					[attr.aria-selected]="active() === tab.id"
					[attr.aria-controls]="idPrefix() + '-panel-' + tab.id"
					[attr.tabindex]="active() === tab.id ? 0 : -1"
					(click)="pick(tab.id)"
					(keydown)="keydown($event, $index)"
				>
					{{ tab.label | t }}
				</button>
			}
		</div>
	`,
})
export class TabsComponent {
	private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
	readonly tabs = input.required<readonly TabItem[]>();
	readonly active = input.required<string>();
	readonly idPrefix = input.required<string>();
	/** Accessible name of the row (English; translated). */
	readonly label = input('Sections');
	readonly selected = output<string>();

	private drag: { x: number; left: number; moved: boolean } | null = null;
	private dragged = false;

	protected pick(id: string) {
		// a drag that ends over a tab must not select it
		if (this.dragged) {
			this.dragged = false;
			return;
		}
		this.selected.emit(id);
		this.host.nativeElement
			.querySelector<HTMLElement>(`[id="${this.idPrefix()}-tab-${id}"]`)
			?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
	}

	/** The mouse wheel scrolls the row sideways when it does not fit. */
	protected wheel(event: WheelEvent) {
		const row = event.currentTarget as HTMLElement;
		if (row.scrollWidth <= row.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
		event.preventDefault();
		row.scrollLeft += event.deltaY;
	}
	protected dragStart(event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;
		this.drag = { x: event.clientX, left: (event.currentTarget as HTMLElement).scrollLeft, moved: false };
	}
	protected dragMove(event: PointerEvent) {
		if (!this.drag) return;
		const dx = event.clientX - this.drag.x;
		if (Math.abs(dx) > 4) this.drag.moved = true;
		(event.currentTarget as HTMLElement).scrollLeft = this.drag.left - dx;
	}
	protected dragEnd() {
		this.dragged = this.drag?.moved ?? false;
		this.drag = null;
	}

	protected keydown(event: KeyboardEvent, index: number) {
		const tabs = this.tabs();
		const last = tabs.length - 1;
		const next =
			event.key === 'ArrowRight'
				? (index + 1) % tabs.length
				: event.key === 'ArrowLeft'
					? (index + last) % tabs.length
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? last
							: -1;
		if (next < 0) return;
		event.preventDefault();
		this.dragged = false;
		this.pick(tabs[next].id);
		(event.currentTarget as HTMLElement).parentElement
			?.querySelectorAll<HTMLElement>('[role="tab"]')
			[next]?.focus();
	}
}
