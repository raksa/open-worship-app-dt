import { Fragment } from 'react';

import { LanguageDataType, LocaleType } from '../lang';
import { BIBLE_VERSE_TEXT_TITLE } from '../helper/helpers';

export type BibleRenderVerseType = {
    num: string;
    text: string;
};
export type BibleItemRenderingType = {
    locale: LocaleType;
    bibleKey: string;
    title: string;
    verses: BibleRenderVerseType[];
};
export type BibleItemRenderingLangType = BibleItemRenderingType & {
    langData: LanguageDataType;
};
export type LyricRenderedType = {
    title: string;
    items: {
        num: number;
        text: string;
    }[];
};

export function FTBibleTable({
    bibleRenderingList,
    isLineSync,
    versesCount,
}: Readonly<{
    bibleRenderingList: BibleItemRenderingLangType[];
    isLineSync: boolean;
    versesCount: number;
}>) {
    const fontFaceList = bibleRenderingList.map(({ langData }) => {
        return langData.genCss();
    });
    const rendThHeader = (
        { langData, bibleKey, title }: BibleItemRenderingLangType,
        i: number,
    ) => {
        return (
            <th
                key={title}
                className="header"
                style={{
                    fontFamily: langData.fontFamily,
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
                {bibleRenderingList.map(({ langData, verses }, j) => {
                    const { num, text } = verses[i];
                    return (
                        <td
                            key={j}
                            style={{
                                fontFamily: langData.fontFamily,
                            }}
                        >
                            <span
                                className="highlight"
                                data-highlight={i}
                                title={BIBLE_VERSE_TEXT_TITLE}
                            >
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
        { langData, verses }: BibleItemRenderingLangType,
        i: number,
    ) => {
        return (
            <td key={i}>
                {verses.map(({ num, text }, j) => {
                    return (
                        <span
                            key={j}
                            className="highlight"
                            title={BIBLE_VERSE_TEXT_TITLE}
                            style={{
                                fontFamily: langData.fontFamily,
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
                    <tr>{bibleRenderingList.map(rendThHeader)}</tr>
                </thead>
                <tbody>
                    {isLineSync ? (
                        Array.from({ length: versesCount }).map(renderTrBody)
                    ) : (
                        <tr>{bibleRenderingList.map(renderTdBody)}</tr>
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
