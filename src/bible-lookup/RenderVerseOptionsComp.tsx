import './RenderVersesOptionComp.scss';

import RenderVerseNumOptionComp, { mouseUp } from './RenderVerseNumOptionComp';
import { useAppEffect, useAppStateAsync } from '../helper/debuggerHelpers';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import { useBibleItemsViewControllerContext } from '../bible-reader/BibleItemsViewController';
import { genVerseList } from '../bible-list/bibleHelpers';

export default function RenderVerseOptionsComp() {
    const bibleItem = useBibleItemContext();
    const { value: verseList } = useAppStateAsync(() => {
        return genVerseList({
            bibleKey: bibleItem.bibleKey,
            bookKey: bibleItem.target.bookKey,
            chapter: bibleItem.target.chapter,
        });
    }, [
        bibleItem.bibleKey,
        bibleItem.target.bookKey,
        bibleItem.target.chapter,
    ]);
    const viewController = useBibleItemsViewControllerContext();
    useAppEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    }, []);
    if (!verseList) {
        return null;
    }
    return (
        <div className="render-found" data-bible-key={bibleItem.bibleKey}>
            <div
                className={
                    'verse-select w-100 d-flex p-1 align-content-start flex-wrap'
                }
            >
                {verseList.map(([verseNum, verseNumStr], i) => {
                    return (
                        <RenderVerseNumOptionComp
                            key={verseNumStr}
                            index={i}
                            verseNum={verseNum}
                            verseNumText={verseNumStr}
                            onVerseChange={(newVerseStart, newVerseEnd) => {
                                viewController.applyTargetOrBibleKey(
                                    bibleItem,
                                    {
                                        target: {
                                            ...bibleItem.target,
                                            verseStart: newVerseStart,
                                            verseEnd:
                                                newVerseEnd ?? newVerseStart,
                                        },
                                    },
                                );
                            }}
                        />
                    );
                })}
                <span
                    className="p-2 pointer"
                    title="Full Verse"
                    onClick={() => {
                        viewController.applyTargetOrBibleKey(bibleItem, {
                            target: {
                                ...bibleItem.target,
                                verseStart: 1,
                                verseEnd: verseList.length,
                            },
                        });
                    }}
                >
                    <i className="bi bi-asterisk" />
                </span>
            </div>
        </div>
    );
}
