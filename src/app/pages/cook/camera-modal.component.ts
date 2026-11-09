import { Component, ElementRef, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { TPipe } from '../../feature/i18n/t.pipe';

/**
 * Takes a photo with the camera, in the ngx-ui modal (see CookComponent). The photo is kept as a data URL
 * in `photo` and nothing uses it yet: later it will be analysed to find ingredients.
 * ModalService sets `close` on the instance.
 */
@Component({
	selector: 'app-camera-modal',
	imports: [TPipe],
	template: `
		<div class="flex flex-col gap-4">
			<h2 id="camera-title" class="text-xl font-semibold">{{ 'Take a photo' | t }}</h2>
			<div class="cook-camera">
				@if (photo(); as shot) {
					<img [src]="shot" alt="" />
				} @else {
					<video #video autoplay playsinline muted></video>
					@if (status() === 'starting') {
						<p class="cook-camera-note" role="status">{{ 'Starting the camera…' | t }}</p>
					}
					@if (status() === 'denied') {
						<p class="cook-camera-note" role="alert">{{ 'Allow camera access to take a photo.' | t }}</p>
					}
					@if (status() === 'unavailable') {
						<p class="cook-camera-note" role="alert">{{ 'Camera is not available.' | t }}</p>
					}
				}
			</div>
			<div class="flex flex-wrap justify-end gap-2">
				@if (photo()) {
					<button class="ds-btn ds-btn-outline" type="button" (click)="retake()">
						{{ 'Retake' | t }}
					</button>
					<button class="ds-btn ds-btn-primary" type="button" (click)="close()">
						{{ 'Done' | t }}
					</button>
				} @else {
					<button class="ds-btn ds-btn-outline" type="button" (click)="close()">
						{{ 'Cancel' | t }}
					</button>
					<button
						class="ds-btn ds-btn-primary"
						type="button"
						[disabled]="status() !== 'ready'"
						(click)="capture()"
					>
						{{ 'Take photo' | t }}
					</button>
				}
			</div>
		</div>
	`,
})
export class CameraModalComponent implements OnInit, OnDestroy {
	close!: () => void;
	private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
	private stream: MediaStream | null = null;
	/** The photo that was taken, as a data URL. Nothing reads it yet. */
	readonly photo = signal<string | null>(null);
	protected readonly status = signal<'starting' | 'ready' | 'denied' | 'unavailable'>('starting');

	ngOnInit() {
		void this.start();
	}

	ngOnDestroy() {
		this.stop();
	}

	private async start() {
		this.status.set('starting');
		if (!navigator.mediaDevices?.getUserMedia) {
			this.status.set('unavailable');
			return;
		}
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: 'environment' } },
				audio: false,
			});
			// the video element exists once the view has rendered
			await new Promise<void>((resolve) => setTimeout(resolve));
			const element = this.video()?.nativeElement;
			if (!element) return;
			element.srcObject = this.stream;
			await element.play();
			this.status.set('ready');
		} catch (error) {
			const name = (error as { name?: string }).name;
			this.status.set(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable');
		}
	}

	private stop() {
		this.stream?.getTracks().forEach((track) => track.stop());
		this.stream = null;
	}

	protected capture() {
		const element = this.video()?.nativeElement;
		if (!element || !element.videoWidth) return;
		const canvas = document.createElement('canvas');
		canvas.width = element.videoWidth;
		canvas.height = element.videoHeight;
		canvas.getContext('2d')?.drawImage(element, 0, 0);
		this.photo.set(canvas.toDataURL('image/jpeg', 0.9));
		this.stop();
	}

	protected retake() {
		this.photo.set(null);
		void this.start();
	}
}
