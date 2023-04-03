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
import { useStateSettingNumber } from '../helper/settingHelper';

export default function BiblePreviewerRender({ bibleItem }: {
    bibleItem: BibleItem,
}) {
    const [fontSize, setFontSize] = useStateSettingNumber(
        'preview-font-S=size', 16);
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
        const targetBibleItem = bibleItems.map((item1) => {
            return item1.clone();
        });
        targetBibleItem[index].bibleKey = bibleKey;
        applyPresents(targetBibleItem);
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
        <div className='card h-100'>
            <div className='card-body d-flex d-flex-row overflow-hidden h-100'>
                {isAvailable ? bibleItems.map((item, i) => {
                    return (
                        <BibleView key={item.bibleKey}
                            index={i}
                            bibleItem={item}
                            onBibleChange={onBibleChangeCallback}
                            onClose={onCloseCallback}
                            fontSize={fontSize} />
                    );
                }) : 'No Bible Available'}
                {isAvailable && <ButtonAddMoreBible
                    bibleItems={bibleItems}
                    applyPresents={applyPresents} />
                }
            </div>
            <div className='card-footer'>
                <BibleViewSetting fontSize={fontSize}
                    setFontSize={setFontSize} />
            </div>
        </div>
    );
}


function BibleViewSetting({ fontSize, setFontSize }: {
    fontSize: number,
    setFontSize: (fontSize: number) => void,
}) {
    return (
        <div className='bible-view-setting'>
            <div className='input-group d-flex'>
                <div className='pe-1'>
                    <label htmlFor="preview-fon-size"
                        className="form-label">
                        Font Size ({fontSize}px):
                    </label>
                </div>
                <div className='flex-fill'>
                    <input id="preview-fon-size"
                        type='range' className='form-range'
                        min={10} max={100} step={2}
                        value={fontSize}
                        onChange={(event) => {
                            setFontSize(Number(event.target.value));
                        }} />
                </div>
            </div>
        </div>
    );
}