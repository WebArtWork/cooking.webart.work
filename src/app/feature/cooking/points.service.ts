import { computed, inject, Service } from '@angular/core';
import { CookingStudyService } from './study.service';
import { cookingRank, POINTS_PER_LESSON } from './points';

/** Cooking points: for now every lesson marked as studied gives the same points, and they never drop. */
@Service()
export class CookingPointsService {
	private readonly study = inject(CookingStudyService);
	readonly points = computed(() => new Set(this.study.marked()).size * POINTS_PER_LESSON);
	readonly level = computed(() => cookingRank(this.points()));
}
