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
  },
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.about": "About me",
  },
} as const;

export type Lang = keyof typeof languages;
