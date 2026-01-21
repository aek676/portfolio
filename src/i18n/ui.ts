export const languages = {
	es: "Español",
	en: "English",
};

export const defaultLang = "es";

export const ui = {
	es: {
		"nav.home": "Inicio",
		"nav.projects": "Proyectos",
		"nav.about": "Sobre mí",
		"nav.changeLang": "Cambiar idoma a ",
		"projectCard.viewProject": "Ver Proyecto",
	},
	en: {
		"nav.home": "Home",
		"nav.projects": "Projects",
		"nav.about": "About me",
		"nav.changeLang": "Change languages to ",
		"projectCard.viewProject": "View Project",
	},
} as const;

export type Lang = keyof typeof languages;
