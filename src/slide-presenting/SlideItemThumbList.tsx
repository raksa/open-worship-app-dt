import { useEffect, useState } from 'react';
import {
    getSlideItemThumbSelectedSetting,
    getSlideDataByFilePath,
    getSlideFilePathSetting,
    setSlideItemThumbSelectedSetting,
    toSlideItemThumbSelected,
    parseSlideItemThumbSelected,
} from '../helper/helpers';
import { usePresentFGClearing } from '../event/PresentEventListener';
import { clearFG } from './slidePresentHelpers';
import { SlideItemThumbType } from '../helper/slideType';
import {
    slideListEventListener,
    useSlideItemThumbOrdering,
    useSlideItemThumbTooling,
    useSlideItemThumbUpdating,
    useSlideSelecting,
} from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import SlideItemThumbListMenu, { ChangeHistory } from './SlideItemThumbListMenu';
import SlideItemThumbListItems from './SlideItemThumbListItems';
import SlideItemThumbListContextMenu, { contextObject } from './SlideItemThumbListContextMenu';

function Empty() {
    return <div className="card-body d-flex justify-content-center align-items-center w-100 h-100">
        Nothing to show 😐
    </div>
}
export default function SlideItemThumbList({ thumbWidth }: { thumbWidth?: number }) {
    const getItemsFromFilePath = (filePath: string | null) => {
        let items: SlideItemThumbType[] | null = null;
        if (filePath !== null) {
            const present = getSlideDataByFilePath(filePath);
            if (present !== null) {
                items = present.items;
            }
        }
        return items;
    };
    const defaultSlideFilePathSelected = getSlideFilePathSetting();
    const [slideFilePathSelected, setSlideFilePathSelected] = useState<string | null>(defaultSlideFilePathSelected);
    const [slideItemThumbs, setSlideItemThumbs] = useState<SlideItemThumbType[] | null>(
        getItemsFromFilePath(defaultSlideFilePathSelected));
    useSlideSelecting((filePath) => {
        setSlideFilePathSelected(filePath);
        setSlideItemThumbs(getItemsFromFilePath(filePath));
    });
    if (slideFilePathSelected === null) {
        slideListEventListener.selectSlideItemThumb(null);
        return <Empty />;
    }
    return (
        <Controller slideItemThumbs={slideItemThumbs} setSlideItemThumbs={setSlideItemThumbs}
            slideFilePathSelected={slideFilePathSelected}
            thumbWidth={thumbWidth || 250} />
    );
}
function Controller({
    slideFilePathSelected,
    thumbWidth,
    slideItemThumbs,
    setSlideItemThumbs,
}: {
    slideFilePathSelected: string,
    thumbWidth: number,
    slideItemThumbs: SlideItemThumbType[] | null,
    setSlideItemThumbs: (items: SlideItemThumbType[] | null) => void,
}) {
    const defaultSlideItemThumbSelected = getSlideItemThumbSelectedSetting();
    const [slideItemThumbSelected, setSlideItemThumbSelected] = useState<string | null>(defaultSlideItemThumbSelected);

    const [slideItemThumbCopied, setSetSlideItemThumbCopied] = useState<number | null>(null);
    const [isModifying, setIsModifying] = useState(false);

    const [undo, setUndo] = useState<ChangeHistory[]>([]);
    const [redo, setRedo] = useState<ChangeHistory[]>([]);

    const setSelectedWithPath = (i: number | null) => {
        if (slideItemThumbs === null || i === null || !slideItemThumbs[i]) {
            return unSelectSlidItemThumb();
        }
        const selected = toSlideItemThumbSelected(slideFilePathSelected, slideItemThumbs[i].id);
        if (selected === null) {
            unSelectSlidItemThumb();
        }
        setSlideItemThumbSelected(selected);
        setSlideItemThumbSelectedSetting(JSON.stringify({ selected: selected || '' }));
    }
    const unSelectSlidItemThumb = () => {
        if (isWindowEditingMode()) {
            slideListEventListener.selectSlideItemThumb(null);
        }
    };
    useEffect(() => {
        if (slideItemThumbs !== null) {
            const parsed = parseSlideItemThumbSelected(slideItemThumbSelected, slideFilePathSelected);
            if (parsed !== null) {
                const found = slideItemThumbs.find((item) => item.id === parsed.id);
                if (found) {
                    slideListEventListener.selectSlideItemThumb(found);
                    return;
                }
            }
        }
        unSelectSlidItemThumb();
    }, [slideFilePathSelected, slideItemThumbs, slideItemThumbSelected]);
    usePresentFGClearing(() => {
        setSelectedWithPath(null);
        clearFG();
    });
    useSlideItemThumbUpdating(() => setIsModifying(true));
    useSlideItemThumbOrdering(() => setIsModifying(true));
    useSlideItemThumbTooling(() => setIsModifying(true));
    if (slideItemThumbs === null) {
        return <Empty />;
    }
    const result = parseSlideItemThumbSelected(slideItemThumbSelected, slideFilePathSelected);
    const selectedIndex = result === null ? null : slideItemThumbs.findIndex((item) => item.id === result.id);
    return (
        <div className='w-100 h-100' style={{ overflow: 'auto' }}
            onContextMenu={(e) => {
                if (contextObject.showSlideItemContextMenu) {
                    contextObject.showSlideItemContextMenu(e);
                }
            }} onPaste={() => contextObject.paste && contextObject.paste()}>
            <SlideItemThumbListMenu
                isModifying={isModifying}
                undo={undo}
                redo={redo}
                slideItemThumbs={slideItemThumbs}
                setIsModifying={setIsModifying}
                setSlideItemThumbs={setSlideItemThumbs}
                setRedo={setRedo}
                setUndo={setUndo}
            />
            <SlideItemThumbListItems
                thumbWidth={thumbWidth}
                slideItemThumbs={slideItemThumbs}
                selectedIndex={selectedIndex}
                setSelectedWithPath={setSelectedWithPath}
                setSetSlideItemThumbCopied={setSetSlideItemThumbCopied}
                setSlideItemThumbs={setSlideItemThumbs}
            />
            <SlideItemThumbListContextMenu
                selectedIndex={selectedIndex}
                slideItemThumbCopied={slideItemThumbCopied}
                undo={undo}
                slideItemThumbs={slideItemThumbs}
                setSelectedWithPath={setSelectedWithPath}
                setIsModifying={setIsModifying}
                setSlideItemThumbs={setSlideItemThumbs}
                setSetSlideItemThumbCopied={setSetSlideItemThumbCopied}
                setUndo={setUndo}
                setRedo={setRedo}
            />
        </div>
    );
}
