import catalog from '../../../data/cooking/catalog.json';
import { COOKING_LOADERS } from './theory.loaders';

export interface Localized {
	en: string;
	ua: string;
}
export interface CookingGroup {
	id: string;
	from: number;
	to: number;
	title: Localized;
}
export interface CookingCard {
	id: number;
	slug: string;
	group: string;
	title: Localized;
	summary: Localized;
}
export interface CookingBody {
	short: string;
	sections: { title: string; text: string }[];
}
export interface CookingTheory extends Omit<CookingCard, 'summary'> {
	en: CookingBody;
	ua: CookingBody;
	related: number[];
	referenceTitle: string;
	references: string[];
}
export const COOKING_GROUPS = catalog.groups as CookingGroup[];
export const COOKING_THEORIES = catalog.theories as CookingCard[];
export const localize = (value: Localized, language: string) =>
	language === 'ua' ? value.ua : value.en;
export const loadCookingTheory = async (slug: string): Promise<CookingTheory> =>
	(await COOKING_LOADERS[slug]()).default as CookingTheory;
