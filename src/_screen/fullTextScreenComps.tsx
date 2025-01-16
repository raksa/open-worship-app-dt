import { Fragment } from 'react';

import { LocaleType } from '../lang';
import { getFontFace, getFontFamilyByLocal } from '../server/fontHelpers';

export type BibleRenderVerseType = {
    num: string;
    text: string;
};
export type BibleItemRenderedType = {
    locale: LocaleType;
    bibleKey: string;
    title: string;
    verses: BibleRenderVerseType[];
};
export type LyricRenderedType = {
    title: string;
    items: {
        num: number;
        text: string;
    }[];
};

export function FTBibleTable({
    bibleRenderedList,
    isLineSync,
    versesCount,
}: Readonly<{
    bibleRenderedList: BibleItemRenderedType[];
    isLineSync: boolean;
    versesCount: number;
}>) {
    const fontFaceList = bibleRenderedList.map(({ locale }) => {
        return getFontFace(locale);
    });
    const rendThHeader = (
        { locale, bibleKey, title }: BibleItemRenderedType,
        i: number,
    ) => {
        return (
            <th
                key={title}
                className="header"
                style={{
                    fontFamily: getFontFamilyByLocal(locale),
                }}
            >
                <div style={{ display: 'flex' }}>
                    <div
                        className="bible highlight bible-name bible-key"
                        data-index={i}
                    >
                        {bibleKey}
                    </div>
                    <div className="title">{title}</div>
                </div>
            </th>
        );
    };
    const renderTrBody = (_: any, i: number) => {
        return (
            <tr key={i}>
                {bibleRenderedList.map(({ locale, verses }, j) => {
                    const { num, text } = verses[i];
                    return (
                        <td
                            key={j}
                            style={{
                                fontFamily: getFontFamilyByLocal(locale),
                            }}
                        >
                            <span className="highlight" data-highlight={i}>
                                <div className="verse-number">{num}</div>
                                {text}
                            </span>
                        </td>
                    );
                })}
            </tr>
        );
    };
    const renderTdBody = (
        { locale, verses }: BibleItemRenderedType,
        i: number,
    ) => {
        return (
            <td key={i}>
                {verses.map(({ num, text }, j) => {
                    return (
                        <span
                            key={j}
                            className="highlight"
                            style={{
                                fontFamily: getFontFamilyByLocal(locale),
                            }}
                            data-highlight={j}
                        >
                            <div className="verse-number">{num}</div>
                            {text}
                        </span>
                    );
                })}
            </td>
        );
    };
    return (
        <div>
            <style
                dangerouslySetInnerHTML={{
                    __html: fontFaceList.join('\n'),
                }}
            />
            <table>
                <thead>
                    <tr>{bibleRenderedList.map(rendThHeader)}</tr>
                </thead>
                <tbody>
                    {isLineSync ? (
                        Array.from({ length: versesCount }).map(renderTrBody)
                    ) : (
                        <tr>{bibleRenderedList.map(renderTdBody)}</tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function FTLyricItem({
    lyricRenderedList,
    isLineSync,
    itemsCount,
}: Readonly<{
    lyricRenderedList: LyricRenderedType[];
    isLineSync: boolean;
    itemsCount: number;
}>) {
    return (
        <table>
            <thead>
                <tr>
                    {lyricRenderedList.map(({ title }) => {
                        return (
                            <th key={title}>
                                <span className="title">{title}</span>
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody>
                {isLineSync ? (
                    Array.from({ length: itemsCount }).map((_, i) => {
                        return (
                            <tr key={i}>
                                {lyricRenderedList.map(({ items }, j) => {
                                    const { num, text } = items[i];
                                    return (
                                        <td key={j}>
                                            <span data-highlight={num}>
                                                {text}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        {lyricRenderedList.map(({ items }, i) => {
                            return (
                                <td key={i}>
                                    {items.map(({ num, text }, j) => {
                                        return (
                                            <Fragment key={j}>
                                                <span
                                                    className="highlight"
                                                    data-highlight={j}
                                                >
                                                    <div className="verse-number">
                                                        {num}
                                                    </div>
                                                    {text}
                                                </span>
                                                <br />
                                            </Fragment>
                                        );
                                    })}
                                </td>
                            );
                        })}
                    </tr>
                )}
            </tbody>
        </table>
    );
}
