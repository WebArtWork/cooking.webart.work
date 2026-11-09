import type { ExploreCard, Text } from '../explore-types';

export interface School extends ExploreCard {
	about: Text;
	programme: { title: Text; text: Text }[];
	length: Text;
	admission: Text;
	city: Text;
	/** Slugs of the recipes the school teaches. */
	recipes: string[];
}

/** Static sample schools. Replace with real schools later. */
export const SCHOOLS: School[] = [
	{
		slug: 'culinary-arts-academy',
		name: 'Culinary Arts Academy',
		meta: { en: 'Kyiv · 2-year programme', ua: 'Київ · дворічна програма' },
		text: {
			en: 'A full professional programme covering technique, kitchen operations and menu design.',
			ua: 'Повна професійна програма: техніка, організація кухні та створення меню.',
		},
		about: {
			en: 'The academy trains professional cooks. Students spend most of the week in teaching kitchens and finish with a placement in a working restaurant.',
			ua: 'Академія готує професійних кухарів. Студенти проводять більшу частину тижня в навчальних кухнях, а завершують навчання практикою в діючому ресторані.',
		},
		programme: [
			{ title: { en: 'Year 1: technique', ua: '1-й рік: техніка' }, text: { en: 'Knife skills, stocks, sauces, methods and food safety.', ua: 'Робота з ножем, бульйони, соуси, способи приготування та безпечність харчових продуктів.' } },
			{ title: { en: 'Year 2: kitchen practice', ua: '2-й рік: практика на кухні' }, text: { en: 'Service, menu design, costing and a restaurant placement.', ua: 'Сервіс, створення меню, калькуляція та практика в ресторані.' } },
		],
		length: { en: '2 years, full-time', ua: '2 роки, денна форма' },
		admission: { en: 'Open to applicants aged 16 and over. An interview and a short tasting task are part of admission.', ua: 'Для вступників від 16 років. Вступ включає співбесіду та коротке практичне завдання.' },
		city: { en: 'Kyiv', ua: 'Київ' },
		recipes: ['weeknight-tomato-pasta', 'crisp-roast-chicken', 'no-knead-bread'],
	},
	{
		slug: 'baking-institute',
		name: 'Baking Institute',
		meta: { en: 'Lviv · Short courses', ua: 'Львів · короткі курси' },
		text: {
			en: 'Hands-on classes in bread, pastry and desserts for beginners and professionals.',
			ua: 'Практичні заняття з хліба, випічки та десертів для початківців і професіоналів.',
		},
		about: {
			en: 'The institute runs short, practical courses in bread, pastry and desserts. Classes are small, and every student bakes at their own station.',
			ua: 'Інститут проводить короткі практичні курси з хліба, випічки та десертів. Групи невеликі, а кожен студент випікає на власному робочому місці.',
		},
		programme: [
			{ title: { en: 'Bread', ua: 'Хліб' }, text: { en: 'Yeast, sourdough and shaping.', ua: 'Дріжджове тісто, закваска та формування.' } },
			{ title: { en: 'Pastry', ua: 'Випічка' }, text: { en: 'Shortcrust, laminated dough and choux.', ua: 'Пісочне, листкове та заварне тісто.' } },
			{ title: { en: 'Desserts', ua: 'Десерти' }, text: { en: 'Creams, custards and plating.', ua: 'Креми, заварні креми та оформлення.' } },
		],
		length: { en: '1 to 6 weeks, evenings and weekends', ua: 'від 1 до 6 тижнів, вечори та вихідні' },
		admission: { en: 'No experience needed for the beginner courses.', ua: 'Для курсів початкового рівня досвід не потрібен.' },
		city: { en: 'Lviv', ua: 'Львів' },
		recipes: ['no-knead-bread'],
	},
	{
		slug: 'school-of-hospitality',
		name: 'School of Hospitality',
		meta: { en: 'Odesa · 3-year programme', ua: 'Одеса · трирічна програма' },
		text: {
			en: 'Combines cooking with service, management and food cost control.',
			ua: 'Поєднує кулінарію з обслуговуванням, менеджментом і контролем собівартості.',
		},
		about: {
			en: 'The school prepares students for restaurant and hotel careers. Cooking is taught together with service, management and the business side of a kitchen.',
			ua: 'Школа готує студентів до кар’єри в ресторанах і готелях. Кулінарію викладають разом з обслуговуванням, менеджментом і фінансовою стороною роботи кухні.',
		},
		programme: [
			{ title: { en: 'Cooking', ua: 'Кулінарія' }, text: { en: 'Core techniques and cuisines.', ua: 'Основні техніки та кухні.' } },
			{ title: { en: 'Service', ua: 'Обслуговування' }, text: { en: 'Front of house, wine and guest care.', ua: 'Зал, вино та робота з гостями.' } },
			{ title: { en: 'Management', ua: 'Менеджмент' }, text: { en: 'Food cost, purchasing and teams.', ua: 'Собівартість, закупівлі та команди.' } },
		],
		length: { en: '3 years, full-time', ua: '3 роки, денна форма' },
		admission: { en: 'Applicants submit a short motivation letter and attend an interview.', ua: 'Вступники подають короткий мотиваційний лист і проходять співбесіду.' },
		city: { en: 'Odesa', ua: 'Одеса' },
		recipes: ['weeknight-tomato-pasta', 'crisp-roast-chicken'],
	},
];
