import { getBibleLocale } from '../helper/bible-helpers/serverBibleHelpers2';
import { checkIsValidLocale, getLangAsync, LocaleType } from '../lang';

export async function applyFontFamily(element: Node) {
    if (!(element instanceof HTMLElement)) {
        return;
    }
    let locale = element.getAttribute('data-locale');
    if (locale === null) {
        const bibleKey = element.getAttribute('data-bible-key');
        if (bibleKey !== null) {
            locale = await getBibleLocale(bibleKey);
        }
    }
    if (locale !== null && checkIsValidLocale(locale)) {
        const lang = await getLangAsync(locale as LocaleType);
        if (lang !== null) {
            element.style.fontFamily = lang.fontFamily;
            return;
        }
    }
}
