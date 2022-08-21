import { useEffect, useState } from 'react';
import { useBibleItemSelecting } from '../event/PreviewingEventListener';
import BibleView from './BibleView';
import { previewer } from './FullTextPreviewer';
import ButtonAddMoreBible from './ButtonAddMoreBible';
import BibleItem from '../bible-list/BibleItem';
import BibleList from '../bible-list/BibleList';
import PresentFTManager from '../_present/PresentFTManager';
import { checkIsFtAutoShow } from './FTPreviewerUtils';

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
        if (checkIsFtAutoShow()) {
            previewer.show();
        }
        setBibleItems(newBibleItems);
    };

    useEffect(() => {
        setBibleItems(BibleItem.convertPresent(bibleItem,
            BibleItem.getBiblePresentingSetting()));
        previewer.show = (event?: React.MouseEvent) => {
            const convertedItems = BibleItem.convertPresent(bibleItem,
                BibleItem.getBiblePresentingSetting());
            PresentFTManager.ftBibleSelect(event || null, convertedItems);
        };
        if (checkIsFtAutoShow()) {
            previewer.show();
        }
        return () => {
            previewer.show = () => void 0;
        };
    }, [bibleItem]);
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
