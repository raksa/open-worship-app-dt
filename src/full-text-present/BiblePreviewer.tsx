import { useEffect, useState } from 'react';
import { useBibleItemSelecting } from '../event/PreviewingEventListener';
import BibleView from './BibleView';
import { previewer } from './FullTextPreviewer';
import { FULL_TEXT_AUTO_SAVE_SETTING } from './Utils';
import bibleHelper from '../server/bible-helpers/bibleHelpers';
import { useChangingBible } from '../event/PresentEventListener';
import ButtonAddMoreBible from './ButtonAddMoreBible';
import { getSetting } from '../helper/settingHelper';
import fullTextPresentHelper from './fullTextPresentHelper';
import BibleItem from '../bible-list/BibleItem';
import BibleList from '../bible-list/BibleList';

let isMounted = false;
export default function BiblePreviewer() {
    const [bibleItem, setBibleItem] = useState<BibleItem | null | undefined>(null);
    useBibleItemSelecting(setBibleItem);
    useEffect(() => {
        if (bibleItem === null) {
            BibleItem.getSelectedItem().then((item) => {
                setBibleItem(item || undefined);
            });
        }
    }, [bibleItem]);

    if (bibleItem === null) {
        return (
            <BibleList />
        );
    }
    if (bibleItem === undefined) {
        return (
            <BibleList />
        );
    }
    return (
        <BiblePreviewerRender bibleItem={bibleItem} />
    );
}
function BiblePreviewerRender({ bibleItem }: { bibleItem: BibleItem }) {
    const [bibleItems, setBibleItems] = useState<BibleItem[]>([]);
    const applyPresents = (newBibleItems: BibleItem[]) => {
        BibleItem.setBiblePresentingSetting(newBibleItems);
        setBibleItems(newBibleItems);
    };

    useEffect(() => {
        setBibleItems(BibleItem.convertPresent(bibleItem,
            BibleItem.getBiblePresentingSetting()));
        isMounted = true;
        previewer.show = () => {
            if (!isMounted) {
                return;
            }
            fullTextPresentHelper.renderBibleItems(BibleItem.convertPresent(bibleItem,
                BibleItem.getBiblePresentingSetting()));
        };
        if (getSetting(FULL_TEXT_AUTO_SAVE_SETTING) === 'true') {
            previewer.show();
        }
        return () => {
            isMounted = false;
        };
    }, [bibleItem]);
    useChangingBible(async (isNext) => {
        let bibleListDefault = await bibleHelper.getBibleListWithStatus();
        bibleListDefault = bibleListDefault.filter(([_, isAvailable]) => {
            return isAvailable;
        });
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
    return (
        <div className='d-flex d-flex-row overflow-hidden h-100'>
            {bibleItems.length ? bibleItems.map((item, i) => {
                return (
                    <BibleView key={`${i}`} bibleItem={item}
                        onBibleChange={(bibleName: string) => {
                            const bibleItem1 = bibleItems.map((item1) => {
                                return item1.clone();
                            });
                            bibleItem1[i].bibleName = bibleName;
                            applyPresents(bibleItem1);
                        }}
                        onClose={() => {
                            const newBibleItems = bibleItems.filter((_, i1) => i1 !== i);
                            applyPresents(newBibleItems);
                        }} />
                );
            }) : 'No Bible Available'}
            {!!bibleItems.length && <ButtonAddMoreBible bibleItems={bibleItems}
                applyPresents={applyPresents} />
            }
        </div>
    );
}
