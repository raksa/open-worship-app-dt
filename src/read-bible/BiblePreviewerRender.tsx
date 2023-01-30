import { useCallback, useState } from 'react';
import BibleView from './BibleView';
import {
    previewer,
} from '../full-text-present/FullTextPreviewer';
import ButtonAddMoreBible from './ButtonAddMoreBible';
import BibleItem from '../bible-list/BibleItem';
import PresentFTManager from '../_present/PresentFTManager';
import {
    checkIsFtAutoShow,
} from '../full-text-present/FTPreviewerUtils';
import { isWindowPresentingMode } from '../App';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function BiblePreviewerRender({ bibleItem }: {
    bibleItem: BibleItem,
}) {
    const [bibleItems, setBibleItems] = useState<BibleItem[]>([]);
    const applyPresents = useCallback((newBibleItems: BibleItem[]) => {
        BibleItem.setBiblePresentingSetting(newBibleItems);
        if (checkIsFtAutoShow()) {
            previewer.show();
        }
        setBibleItems(newBibleItems);
    }, [setBibleItems]);
    const onBibleChangeCallback = useCallback((
        bibleKey: string, index: number) => {
        const bibleItem1 = bibleItems.map((item1) => {
            return item1.clone();
        });
        bibleItem1[index].bibleKey = bibleKey;
        applyPresents(bibleItem1);
    }, [bibleItems]);
    const onCloseCallback = useCallback((index: number) => {
        const newBibleItems = bibleItems.filter((_, i1) => {
            return i1 !== index;
        });
        applyPresents(newBibleItems);
    }, [bibleItems]);
    useAppEffect(() => {
        setBibleItems(BibleItem.convertPresent(bibleItem,
            BibleItem.getBiblePresentingSetting()));
        previewer.show = (event?: React.MouseEvent) => {
            const convertedItems = BibleItem.convertPresent(bibleItem,
                BibleItem.getBiblePresentingSetting());
            PresentFTManager.ftBibleItemSelect(event || null, convertedItems);
        };
        if (isWindowPresentingMode() && checkIsFtAutoShow()) {
            previewer.show();
        }
        return () => {
            previewer.show = () => void 0;
        };
    }, [bibleItem]);
    const isAvailable = bibleItems.length > 0;
    return (
        <div className='d-flex d-flex-row overflow-hidden h-100'>
            {isAvailable ? bibleItems.map((item, i) => {
                return (
                    <BibleView key={item.id}
                        index={i}
                        bibleItem={item}
                        onBibleChange={onBibleChangeCallback}
                        onClose={onCloseCallback} />
                );
            }) : 'No Bible Available'}
            {isAvailable && <ButtonAddMoreBible
                bibleItems={bibleItems}
                applyPresents={applyPresents} />
            }
        </div>
    );
}
