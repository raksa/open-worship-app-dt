import { useEffect, useState } from 'react';
import { useBibleItemSelecting } from '../event/PreviewingEventListener';
import BibleView from './BibleView';
import { previewer } from './FullTextPreviewer';
import bibleHelper from '../server/bible-helpers/bibleHelpers';
import ButtonAddMoreBible from './ButtonAddMoreBible';
import BibleItem from '../bible-list/BibleItem';
import BibleList from '../bible-list/BibleList';
import PresentFTManager from '../_present/PresentFTManager';
import { usePFTMEvents } from '../_present/presentEventHelpers';

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
        previewer.show = (event: React.MouseEvent) => {
            const convertedItems = BibleItem.convertPresent(bibleItem,
                BibleItem.getBiblePresentingSetting());
            PresentFTManager.ftBibleSelect(event, convertedItems);
        };
        return () => {
            previewer.show = () => void 0;
        };
    }, [bibleItem]);
    usePFTMEvents(['change-bible'], undefined, async (isNext) => {
        let bibleListDefault = await bibleHelper.getBibleListWithStatus();
        bibleListDefault = bibleListDefault.filter(([_, isAvailable]) => {
            return isAvailable;
        });
        const bibleList = bibleListDefault.map(([bible]) => bible);
        if (bibleItems.length === 1 && bibleList.length > 1) {
            const currentBible = bibleItems[0].bibleName;
            let currentIndex = bibleList.indexOf(currentBible);
            if (currentIndex > -1) {
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
