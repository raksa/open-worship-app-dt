import './RenderVersesOptionComp.scss';

import RenderVerseNumOptionComp, { mouseUp } from './RenderVerseNumOptionComp';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useGenVerseList } from '../helper/bible-helpers/serverBibleHelpers';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import { useBibleItemsViewControllerContext } from '../bible-reader/BibleItemsViewController';

export default function RenderVerseOptionsComp() {
    const bibleItem = useBibleItemContext();
    const verseList = useGenVerseList(bibleItem);
    const viewController = useBibleItemsViewControllerContext();
    useAppEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    }, []);
    if (verseList === null) {
        return null;
    }
    return (
        <div className="render-found" data-bible-key={bibleItem.bibleKey}>
            <div
                className={
                    'verse-select d-flex p-1 align-content-start flex-wrap'
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
