import { getBibleLocale } from '../helper/bible-helpers/serverBibleHelpers2';
import { useAppStateAsync } from '../helper/debuggerHelpers';
import { getLangAsync, LocaleType } from '../lang';

export function FontFamilyComp({
    locale,
    children,
}: Readonly<{
    locale: LocaleType;
    children: React.ReactNode;
}>) {
    const { value: lang } = useAppStateAsync(getLangAsync(locale));
    if (!lang) {
        return <>{children}</>;
    }
    return (
        <>
            <style>{lang.genCss()}</style>
            <span
                style={{
                    fontFamily: lang.fontFamily,
                }}
            >
                {children}
            </span>
        </>
    );
}

export function BibleItemFontFamilyComp({
    bibleKey,
    children,
}: Readonly<{
    bibleKey: string;
    children: React.ReactNode;
}>) {
    const { value: locale } = useAppStateAsync(getBibleLocale(bibleKey));
    if (!locale) {
        return <>{children}</>;
    }
    return <FontFamilyComp locale={locale}>{children}</FontFamilyComp>;
}
