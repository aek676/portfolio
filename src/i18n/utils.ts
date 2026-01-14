import { ui, defaultLang, type Lang } from "./ui";
import { getRelativeLocaleUrl } from "astro:i18n";

export function useTranslations(currentLocale = defaultLang) {
  const lang = currentLocale as Lang;
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    if (ui[lang] && ui[lang][key]) {
      return ui[lang][key];
    }

    return ui[defaultLang][key];
  };
}

export function getUrl(currentLocale = defaultLang, page: string) {
  const lang = currentLocale as Lang;
  return getRelativeLocaleUrl(lang, page);
}
