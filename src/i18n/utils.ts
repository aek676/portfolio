import { getRelativeLocaleUrl } from "astro:i18n";
import { defaultLang, type Lang, ui } from "./ui";

export function getTranslations(currentLocale = defaultLang) {
	const lang = currentLocale as Lang;
	return function t(key: keyof (typeof ui)[typeof defaultLang]) {
		if (ui[lang]?.[key]) {
			return ui[lang][key];
		}

		return ui[defaultLang][key];
	};
}

export function getUrl(currentLocale = defaultLang, page?: string) {
	const lang = currentLocale as Lang;

	if (!page) {
		return getRelativeLocaleUrl(lang);
	}

	return getRelativeLocaleUrl(lang, page);
}
