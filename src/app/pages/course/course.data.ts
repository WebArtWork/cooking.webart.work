import type { ExploreCard, Text } from '../explore-types';

export interface Course extends ExploreCard {
	level: Text;
	length: Text;
	audience: Text;
	modules: { title: Text; text: Text }[];
	outcome: Text;
	/** Slugs of the recipes the course teaches. */
	recipes: string[];
}

/** Static sample courses. Replace with real courses later. */
export const COURSES: Course[] = [
	{
		slug: 'knife-skills-weekend',
		name: 'Knife skills in a weekend',
		meta: { en: '2 days · Beginner', ua: '2 дні · Початковий рівень' },
		text: {
			en: 'Grip, cuts and sharpening, practised on everyday vegetables.',
			ua: 'Хват, нарізання та заточування, які відпрацьовують на щоденних овочах.',
		},
		level: { en: 'Beginner', ua: 'Початковий рівень' },
		length: { en: '2 days, 5 hours each', ua: '2 дні по 5 годин' },
		audience: { en: 'Home cooks who want to cut faster, safer and more evenly.', ua: 'Для домашніх кухарів, які хочуть різати швидше, безпечніше й рівніше.' },
		modules: [
			{ title: { en: 'Grip and posture', ua: 'Хват і постава' }, text: { en: 'How to hold the knife and guide the food.', ua: 'Як тримати ніж і направляти продукт.' } },
			{ title: { en: 'Core cuts', ua: 'Основні нарізки' }, text: { en: 'Slice, dice, julienne and chop.', ua: 'Скибки, кубики, соломка та подрібнення.' } },
			{ title: { en: 'Sharpening', ua: 'Заточування' }, text: { en: 'Honing and sharpening a kitchen knife.', ua: 'Правка й заточування кухонного ножа.' } },
		],
		outcome: { en: 'You will cut common vegetables evenly and know how to keep a knife sharp.', ua: 'Ви рівно нарізатимете поширені овочі та знатимете, як підтримувати ніж гострим.' },
		recipes: ['weeknight-tomato-pasta', 'crisp-roast-chicken'],
	},
	{
		slug: 'bread-baking-basics',
		name: 'Bread baking basics',
		meta: { en: '4 weeks · Beginner', ua: '4 тижні · Початковий рівень' },
		text: {
			en: 'From a first loaf to your own sourdough starter, step by step.',
			ua: 'Від першої буханки до власної закваски, крок за кроком.',
		},
		level: { en: 'Beginner', ua: 'Початковий рівень' },
		length: { en: '4 weeks, one session a week', ua: '4 тижні, одне заняття на тиждень' },
		audience: { en: 'Anyone who wants to bake bread at home without special equipment.', ua: 'Для всіх, хто хоче пекти хліб удома без спеціального обладнання.' },
		modules: [
			{ title: { en: 'Week 1: the first loaf', ua: 'Тиждень 1: перша буханка' }, text: { en: 'Flour, water, salt and yeast.', ua: 'Борошно, вода, сіль і дріжджі.' } },
			{ title: { en: 'Week 2: shaping and proofing', ua: 'Тиждень 2: формування та вистоювання' }, text: { en: 'Build strength and read the dough.', ua: 'Як створити міцність тіста й читати його стан.' } },
			{ title: { en: 'Week 3: sourdough starter', ua: 'Тиждень 3: закваска' }, text: { en: 'Start, feed and keep a starter.', ua: 'Запуск, підживлення та зберігання закваски.' } },
			{ title: { en: 'Week 4: your own loaf', ua: 'Тиждень 4: власна буханка' }, text: { en: 'Bake a sourdough loaf from start to finish.', ua: 'Випічка хліба на заквасці від початку до кінця.' } },
		],
		outcome: { en: 'You will bake reliable loaves and keep a healthy starter.', ua: 'Ви пектимете стабільно якісні буханки та підтримуватимете здорову закваску.' },
		recipes: ['no-knead-bread'],
	},
	{
		slug: 'food-safety-essentials',
		name: 'Food safety essentials',
		meta: { en: '3 hours · All levels', ua: '3 години · Для всіх рівнів' },
		text: {
			en: 'Temperatures, storage and cross-contamination for home and professional kitchens.',
			ua: 'Температури, зберігання та перехресне забруднення для домашніх і професійних кухонь.',
		},
		level: { en: 'All levels', ua: 'Для всіх рівнів' },
		length: { en: '3 hours, one session', ua: '3 години, одне заняття' },
		audience: { en: 'Home cooks and kitchen staff who want a clear, practical routine.', ua: 'Для домашніх кухарів і працівників кухні, яким потрібна зрозуміла практична схема.' },
		modules: [
			{ title: { en: 'Temperatures', ua: 'Температури' }, text: { en: 'Safe cooking, cooling and reheating.', ua: 'Безпечне приготування, охолодження та розігрівання.' } },
			{ title: { en: 'Storage', ua: 'Зберігання' }, text: { en: 'Fridge order, dates and leftovers.', ua: 'Порядок у холодильнику, дати та залишки.' } },
			{ title: { en: 'Cross-contamination', ua: 'Перехресне забруднення' }, text: { en: 'Boards, hands and surfaces.', ua: 'Дошки, руки та поверхні.' } },
		],
		outcome: { en: 'You will have a simple checklist for safe cooking and storage.', ua: 'Ви матимете простий список перевірки для безпечного приготування та зберігання.' },
		recipes: ['crisp-roast-chicken'],
	},
];
