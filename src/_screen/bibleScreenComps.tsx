import { LanguageDataType, LocaleType } from '../lang';
import { BIBLE_VERSE_TEXT_TITLE } from '../helper/helpers';

export type BibleRenderVerseType = {
    num: string;
    text: string;
    verseKey: string;
    kjvVerseKey: string;
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

function VerseTextElementComp({
    highlightIndex,
    bibleKey,
    kjvVerseKey,
    verseKey,
    num,
    text,
    langData,
}: Readonly<{
    highlightIndex: number;
    bibleKey: string;
    kjvVerseKey: string;
    verseKey: string;
    num: string;
    text: string;
    langData: LanguageDataType;
}>) {
    return (
        <span
            className="highlight"
            data-highlight={highlightIndex}
            title={BIBLE_VERSE_TEXT_TITLE}
            data-bible-key={bibleKey}
            data-kjv-verse-key={kjvVerseKey}
            data-verse-key={verseKey}
            style={{
                fontFamily: langData.fontFamily,
            }}
        >
            <div className="verse-number">{num}</div>
            {text}
        </span>
    );
}

export function BibleBibleTable({
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
                {bibleRenderingList.map(({ langData, verses, bibleKey }, j) => {
                    const { num, text, verseKey, kjvVerseKey } = verses[i];
                    return (
                        <td key={j}>
                            <VerseTextElementComp
                                highlightIndex={i}
                                bibleKey={bibleKey}
                                kjvVerseKey={kjvVerseKey}
                                verseKey={verseKey}
                                num={num}
                                text={text}
                                langData={langData}
                            />
                        </td>
                    );
                })}
            </tr>
        );
    };
    const renderTdBody = (
        { langData, verses, bibleKey }: BibleItemRenderingLangType,
        i: number,
    ) => {
        return (
            <td key={i}>
                {verses.map(({ num, text, kjvVerseKey, verseKey }, j) => {
                    return (
                        <VerseTextElementComp
                            key={j}
                            highlightIndex={j}
                            bibleKey={bibleKey}
                            kjvVerseKey={kjvVerseKey}
                            verseKey={verseKey}
                            num={num}
                            text={text}
                            langData={langData}
                        />
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
