/** A text in both languages. */
export interface Text {
	en: string;
	ua: string;
}

/** What every Explore card needs; each kind of page adds its own details. */
export interface ExploreCard {
	/** Names are made up and stay the same in both languages. */
	slug: string;
	name: string;
	meta: Text;
	text: Text;
}

export const pickText = (text: Text, language: string) => (language === 'ua' ? text.ua : text.en);
