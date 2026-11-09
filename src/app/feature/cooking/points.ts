import type { IconName } from '../../components/icon/icon.data';

/** Cooking points a lesson gives when it is marked as studied. */
export const POINTS_PER_LESSON = 10;

export interface CookingRank {
	/** Points needed to reach the rank. */
	min: number;
	icon: IconName;
	/** English name; it is also the translation key. */
	name: string;
}

/** Six ranks, one every 500 points. The names and steps are placeholders to adjust later. */
export const COOKING_RANKS: readonly CookingRank[] = [
	{ min: 0, icon: 'rank-bowl', name: 'Kitchen newcomer' },
	{ min: 500, icon: 'rank-egg', name: 'Home cook' },
	{ min: 1000, icon: 'rank-bread', name: 'Baker' },
	{ min: 1500, icon: 'rank-soup', name: 'Line cook' },
	{ min: 2000, icon: 'rank-pepper', name: 'Sous-chef' },
	{ min: 2500, icon: 'rank-chef', name: 'Head chef' },
];

export function cookingRank(points: number) {
	let index = 0;
	COOKING_RANKS.forEach((rank, i) => {
		if (points >= rank.min) index = i;
	});
	const rank = COOKING_RANKS[index];
	const next = (COOKING_RANKS[index + 1] ?? null) as CookingRank | null;
	const progress = next ? (points - rank.min) / (next.min - rank.min) : 1;
	return { rank, index, next, toNext: next ? next.min - points : 0, progress };
}
