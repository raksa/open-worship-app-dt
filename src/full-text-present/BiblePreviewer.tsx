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
import BibleList from '../bible-list/BibleList';
import FileReadError from '../others/FileReadError';
import { showAppContextMenu } from '../others/AppContextMenu';

let isMounted = false;
export default function BiblePreviewer() {
    const [bibleItem, setBibleItem] = useState<BibleItem | null | undefined>(null);
    const applyPresents = (newBibleItems: BibleItem[]) => {
        BibleItem.setBiblePresentingSetting(newBibleItems);
        setBibleItem(null);
    };
    useBibleItemSelecting(setBibleItem);
    useEffect(() => {
        if (bibleItem === null) {
            BibleItem.getSelectedItem().then((item) => {
                setBibleItem(item || undefined);
            });
        }
    }, [bibleItem]);

    useEffect(() => {
        isMounted = true;
        previewer.show = () => {
            if (!isMounted) {
                return;
            }
            fullTextPresentHelper.renderBibleItems(bibleItems);
        };
        if (getSetting(FULL_TEXT_AUTO_SAVE_SETTING) === 'true') {
            previewer.show();
        }
        return () => {
            isMounted = false;
        };
    });
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

    if (bibleItem === null) {
        return (
            <BibleList />
        );
    }
    if (bibleItem === undefined) {
        return (
            <FileReadError onContextMenu={(e) => {
                showAppContextMenu(e, [{
                    title: 'Reload', onClick: () => setBibleItem(null),
                }]);
            }} />
        );
    }
    const bibleItems = BibleItem.convertPresent(bibleItem,
        BibleItem.getBiblePresentingSetting());
    return (
        <div className='d-flex d-flex-row overflow-hidden h-100'>
            {bibleItems.length ? bibleItems.map((item, i) => {
                return (
                    <BibleView key={`${i}`} bibleItem={item}
                        onBibleChange={(bibleName: string) => {
                            bibleItems[i].bibleName = bibleName;
                            applyPresents(bibleItems);
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
