import { ui, defaultLang, type Lang } from "./ui";

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    if (ui[lang] && ui[lang][key]) {
      return ui[lang][key];
    }

    return ui[defaultLang][key];
  };
}
