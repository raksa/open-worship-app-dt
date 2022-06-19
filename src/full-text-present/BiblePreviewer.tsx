import { useEffect, useState } from 'react';
import { useBibleItemSelecting } from '../event/PreviewingEventListener';
import BibleView from './BibleView';
import { previewer } from './FullTextPreviewer';
import { FULL_TEXT_AUTO_SAVE_SETTING } from './Utils';
import bibleHelper from '../bible-helper/bibleHelpers';
import { useChangingBible } from '../event/PresentEventListener';
import ButtonAddMoreBible from './ButtonAddMoreBible';
import { getSetting } from '../helper/settingHelper';
import fullTextPresentHelper from './previewingHelper';
import BibleItem from '../bible-list/BibleItem';

let isMounted = false;
export default function BiblePreviewer() {
    const [bibleItems, setBiblePresents] = useState<BibleItem[]>(
        BibleItem.getBiblePresentingSetting());
    const applyPresents = (newBibleItems: BibleItem[]) => {
        setBiblePresents(newBibleItems);
        BibleItem.setBiblePresentingSetting(newBibleItems);
    };

    useEffect(() => {
        isMounted = true;
        previewer.show = () => {
            if (!isMounted) {
                return;
            }
            fullTextPresentHelper.renderBibleFromBiblePresentList(bibleItems);
        };
        if (getSetting(FULL_TEXT_AUTO_SAVE_SETTING) === 'true') {
            previewer.show();
        }
        return () => {
            isMounted = false;
        };
    });
    useBibleItemSelecting((bibleItem) => {
        if (bibleItem === null) {
            applyPresents([]);
        } else {
            applyPresents(BibleItem.convertPresent(bibleItem, bibleItems));
        }
    });
    useChangingBible(async (isNext) => {
        let bibleListDefault = await bibleHelper.getBibleListWithStatus();
        bibleListDefault = bibleListDefault.filter(([_, isAvailable]) => isAvailable);
        const bibleList = bibleListDefault.map(([bible]) => bible);
        if (bibleItems.length === 1 && bibleList.length > 1) {
            const currentBible = bibleItems[0].bibleName;
            let currentIndex = bibleList.indexOf(currentBible);
            if (~currentIndex) {
                currentIndex = (bibleList.length + currentIndex + (isNext ? 1 : -1))
                    % bibleList.length;
                const newPresents = [...bibleItems];
                newPresents[0].bibleName = bibleList[currentIndex];
                applyPresents(newPresents);
            }
        }
    });

    if (bibleItems === null) {
        return (
            <div className='alert alert-warning'>No Bible Selected</div>
        );
    }
    return (
        <div className='d-flex d-flex-row overflow-hidden h-100'>
            {bibleItems.length ? bibleItems.map((bibleItem, i) => {
                return (
                    <BibleView key={`${i}`} bibleItem={bibleItem}
                        i={i} onBibleChange={(bibleName: string) => {
                            applyPresents(bibleItems.map((item, i1) => {
                                if (i1 === i) {
                                    item.bibleName = bibleName;
                                }
                                return item;
                            }));
                        }}
                        onClose={() => {
                            applyPresents(bibleItems.filter((_, i1) => i1 !== i));
                        }} />
                );
            }) : 'No Bible Available'}
            {bibleItems.length && <ButtonAddMoreBible bibleItems={bibleItems}
                applyPresents={applyPresents} />
            }
        </div>
    );
}
