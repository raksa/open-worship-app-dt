import { AnyObjectType } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';

export const locales = ['km', 'en'];
export type LocalType = 'km' | 'en';
export type LanguageType = {
  numList: string[];
  dictionary: AnyObjectType;
  name: string;
  locale: LocalType;
  flagSVG: string;
};

export const defaultLocal: LocalType = 'en';
let currentLocal: LocalType = defaultLocal;
export function setCurrentLocale(local: LocalType) {
  setSetting('language-local', local);
  currentLocal = local;
}
export function getCurrentLocale() {
  const lc = getSetting('language-local', 'en');
  if (locales.includes(lc)) {
    currentLocal = lc as LocalType;
  }
  return currentLocal;
}

const cache: Map<string, LanguageType> = new Map();
export function getLang(lang: string) {
  return cache.get(lang) || null;
}
async function importLang(local: LocalType) {
  const langData = await import(`./data/${local}`);
  return langData.default;
}
export async function getLangAsync(local: LocalType) {
  if (!cache.has(local)) {
    try {
      const langData = await importLang(local);
      cache.set(local, langData);
    } catch (error) {
      console.log(error);
    }
  }
  return getLang(local);
}
export function getCurrentLangAsync() {
  return getLangAsync(getCurrentLocale());
}
export async function getAllLangsAsync() {
  const allLangs = await Promise.all(locales.map((local) => {
    return importLang(local as LocalType);
  }));
  return allLangs.filter((lang) => lang !== null) as LanguageType[];
}

export function tran(text: string) {
  const langData = getLang(currentLocal);
  if (langData === null) {
    return text;
  }
  const dictionary = langData.dictionary;
  return dictionary[text] || text;
}

export const toLocaleNum = (local: LocalType, n: number): string => {
  const langData = getLang(local);
  if (langData === null) {
    return `${n}`;
  }
  const numList = langData.numList;
  return `${n}`.split('').map(n1 => numList[+n1]).join('');
};

export function fromLocaleNum(local: LocalType, localeNum: string) {
  const langData = getLang(local);
  if (langData === null) {
    return null;
  }
  const numList = langData.numList;
  const nString = `${localeNum}`.split('').map(n => {
    const ind = numList.indexOf(n);
    if (~ind) {
      return ind;
    }
    return n;
  }).join('');
  if (isNaN(+nString)) {
    return null;
  }
  return Number(nString);
}
