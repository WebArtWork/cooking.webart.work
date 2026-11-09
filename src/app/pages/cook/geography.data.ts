export interface Region {
	id: string;
	name: { en: string; ua: string };
	/** ISO 3166-1 alpha-2 codes of the countries and territories of the region. */
	countries: readonly string[];
}

/**
 * The 18 geographic regions a recipe can belong to, grouped by culinary neighbourhood rather than by strict
 * UN geoscheme. Every country belongs to exactly one region.
 */
export const REGIONS: readonly Region[] = [
	{ id: 'northern-europe', name: { en: 'Northern Europe', ua: 'Північна Європа' }, countries: ['DK', 'EE', 'FI', 'IS', 'IE', 'LV', 'LT', 'NO', 'SE', 'GB'] },
	{ id: 'western-europe', name: { en: 'Western Europe', ua: 'Західна Європа' }, countries: ['AT', 'BE', 'FR', 'DE', 'LI', 'LU', 'MC', 'NL', 'CH'] },
	{ id: 'eastern-europe', name: { en: 'Eastern Europe', ua: 'Східна Європа' }, countries: ['BY', 'BG', 'CZ', 'HU', 'MD', 'PL', 'RO', 'RU', 'SK', 'UA'] },
	{ id: 'southern-europe', name: { en: 'Southern Europe', ua: 'Південна Європа' }, countries: ['AL', 'AD', 'BA', 'HR', 'GR', 'IT', 'MT', 'ME', 'MK', 'PT', 'SM', 'RS', 'SI', 'ES', 'VA'] },
	{ id: 'western-asia', name: { en: 'Western Asia and the Middle East', ua: 'Західна Азія та Близький Схід' }, countries: ['AM', 'AZ', 'BH', 'CY', 'GE', 'IR', 'IQ', 'IL', 'JO', 'KW', 'LB', 'OM', 'PS', 'QA', 'SA', 'SY', 'TR', 'AE', 'YE'] },
	{ id: 'central-asia', name: { en: 'Central Asia', ua: 'Центральна Азія' }, countries: ['KZ', 'KG', 'TJ', 'TM', 'UZ'] },
	{ id: 'south-asia', name: { en: 'South Asia', ua: 'Південна Азія' }, countries: ['AF', 'BD', 'BT', 'IN', 'MV', 'NP', 'PK', 'LK'] },
	{ id: 'east-asia', name: { en: 'East Asia', ua: 'Східна Азія' }, countries: ['CN', 'HK', 'JP', 'KP', 'KR', 'MO', 'MN', 'TW'] },
	{ id: 'southeast-asia', name: { en: 'Southeast Asia', ua: 'Південно-Східна Азія' }, countries: ['BN', 'KH', 'ID', 'LA', 'MY', 'MM', 'PH', 'SG', 'TL', 'TH', 'VN'] },
	{ id: 'northern-africa', name: { en: 'Northern Africa', ua: 'Північна Африка' }, countries: ['DZ', 'EG', 'LY', 'MA', 'SD', 'TN'] },
	{ id: 'western-africa', name: { en: 'Western Africa', ua: 'Західна Африка' }, countries: ['BJ', 'BF', 'CV', 'CI', 'GM', 'GH', 'GN', 'GW', 'LR', 'ML', 'MR', 'NE', 'NG', 'SN', 'SL', 'TG'] },
	{ id: 'central-africa', name: { en: 'Central Africa', ua: 'Центральна Африка' }, countries: ['AO', 'CM', 'CF', 'TD', 'CG', 'CD', 'GQ', 'GA', 'ST'] },
	{ id: 'eastern-africa', name: { en: 'Eastern Africa', ua: 'Східна Африка' }, countries: ['BI', 'KM', 'DJ', 'ER', 'ET', 'KE', 'MG', 'MW', 'MU', 'MZ', 'RW', 'SC', 'SO', 'SS', 'TZ', 'UG', 'ZM', 'ZW'] },
	{ id: 'southern-africa', name: { en: 'Southern Africa', ua: 'Південна Африка' }, countries: ['BW', 'SZ', 'LS', 'NA', 'ZA'] },
	{ id: 'northern-america', name: { en: 'Northern America', ua: 'Північна Америка' }, countries: ['CA', 'US'] },
	{ id: 'central-america-caribbean', name: { en: 'Central America and the Caribbean', ua: 'Центральна Америка та Кариби' }, countries: ['BZ', 'CR', 'SV', 'GT', 'HN', 'MX', 'NI', 'PA', 'AG', 'BS', 'BB', 'CU', 'DM', 'DO', 'GD', 'HT', 'JM', 'KN', 'LC', 'VC', 'TT', 'PR'] },
	{ id: 'south-america', name: { en: 'South America', ua: 'Південна Америка' }, countries: ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'] },
	{ id: 'oceania', name: { en: 'Oceania', ua: 'Океанія' }, countries: ['AU', 'FJ', 'KI', 'MH', 'FM', 'NR', 'NZ', 'PW', 'PG', 'WS', 'SB', 'TO', 'TV', 'VU'] },
];

export const regionById = (id: string) => REGIONS.find((region) => region.id === id);

/** The region a country belongs to. */
export const regionOfCountry = (code: string) => REGIONS.find((region) => region.countries.includes(code));

const names = new Map<string, Intl.DisplayNames>();

/** A country's name in a language, from the browser's own data ('ua' is the code 'uk' for the browser). */
export function countryName(code: string, language: 'en' | 'ua'): string {
	const locale = language === 'ua' ? 'uk' : 'en';
	let display = names.get(locale);
	if (!display) {
		display = new Intl.DisplayNames([locale], { type: 'region' });
		names.set(locale, display);
	}
	try {
		return display.of(code) ?? code;
	} catch {
		return code;
	}
}

/** The countries of a region, sorted by their name in the language. */
export function countriesOf(regionId: string, language: 'en' | 'ua') {
	const region = regionById(regionId);
	if (!region) return [];
	const locale = language === 'ua' ? 'uk' : 'en';
	return region.countries
		.map((code) => ({ code, name: countryName(code, language) }))
		.sort((a, b) => a.name.localeCompare(b.name, locale));
}
