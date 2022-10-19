import { AnyObjectType } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProvider from '../server/appProvider';

export const locales = ['km', 'en'] as const;
export type LocaleType = typeof locales[number];
export type LanguageType = {
  numList: string[];
  dictionary: AnyObjectType;
  name: string;
  locale: LocaleType;
  flagSVG: string;
};

export const defaultLocal: LocaleType = 'en';
let currentLocale: LocaleType = defaultLocal;
export function setCurrentLocale(locale: LocaleType) {
  setSetting('language-locale', locale);
  currentLocale = locale;
}
export function checkIsValidLocale(locale: any) {
  return locales.includes(locale);
}
export function getCurrentLocale() {
  const lc = getSetting('language-locale', 'en');
  if (checkIsValidLocale(lc)) {
    currentLocale = lc as LocaleType;
  }
  return currentLocale;
}

const cache = new Map<string, LanguageType>();
export function getLang(lang: string) {
  return cache.get(lang) || null;
}
async function importLang(locale: LocaleType) {
  const langData = await import(`./data/${locale}`);
  return langData.default;
}
export async function getLangAsync(locale: LocaleType) {
  if (!cache.has(locale)) {
    try {
      const langData = await importLang(locale);
      cache.set(locale, langData);
    } catch (error) {
      appProvider.appUtils.handleError(error);
    }
  }
  return getLang(locale);
}
export function getCurrentLangAsync() {
  return getLangAsync(getCurrentLocale());
}
export async function getAllLangsAsync() {
  const allLangs = await Promise.all(locales.map((locale) => {
    return importLang(locale);
  }));
  return allLangs.filter((lang) => lang !== null) as LanguageType[];
}

export function tran(text: string) {
  const langData = getLang(currentLocale);
  if (langData === null) {
    return text;
  }
  const dictionary = langData.dictionary;
  return dictionary[text] || text;
}

export const toLocaleNum = (locale: LocaleType, n: number): string => {
  const langData = getLang(locale);
  if (langData === null) {
    return `${n}`;
  }
  const numList = langData.numList;
  return `${n}`.split('').map((n1) => {
    return numList[+n1];
  }).join('');
};

export function fromLocaleNum(locale: LocaleType, localeNum: string) {
  const langData = getLang(locale);
  if (langData === null) {
    return null;
  }
  const numList = langData.numList;
  const nString = `${localeNum}`.split('').map((n) => {
    const ind = numList.indexOf(n);
    if (ind > -1) {
      return ind;
    }
    return n;
  }).join('');
  if (isNaN(+nString)) {
    return null;
  }
  return Number(nString);
}
