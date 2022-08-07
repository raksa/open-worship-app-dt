import {
    KeyboardType,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    useSlideItemSizing,
} from '../../event/SlideListEventListener';
import { isWindowEditingMode } from '../../App';
import { Fragment, useState } from 'react';
import SlideItemRender from './SlideItemRender';
import {
    THUMBNAIL_WIDTH_SETTING_NAME,
    DEFAULT_THUMBNAIL_SIZE,
} from '../../slide-list/slideHelpers';
import { usePresentFGClearing } from '../../event/PresentEventListener';
import SlideItemGhost from './SlideItemGhost';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import SlideItem from '../../slide-list/SlideItem';
import Slide from '../../slide-list/Slide';
import { useFSEvents } from '../../helper/FileSource';

export default function SlideItems({ slide }: { slide: Slide }) {
    const [thumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    useFSEvents(['select', 'edit'], slide.fileSource);
    usePresentFGClearing(() => {
        SlideItem.setSelectedItem(null);
    });
    const slideItems = slide.items;
    if (!isWindowEditingMode()) {
        const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];
        const arrowListener = (e: KeyboardEvent) => {
            const selectedIndex = slide.selectedIndex;
            if (selectedIndex > -1) {
                return;
            }
            const length = slideItems.length;
            if (length) {
                let ind = e.key === 'ArrowLeft' ?
                    selectedIndex - 1 : selectedIndex + 1;
                if (ind >= length) {
                    ind = 0;
                } else if (ind < 0) {
                    ind = length - 1;
                }
                slide.selectedIndex = ind;
            }
        };
        const useCallback = (key: KeyboardType) => {
            useKeyboardRegistering({ key }, arrowListener);
        };
        arrows.forEach(useCallback);
    }
    return (
        <div className='d-flex flex-wrap justify-content-center'>
            {slideItems.map((item, i) => {
                const shouldReceiveAtFirst = draggingIndex !== null &&
                    draggingIndex !== 0 && i === 0;
                const shouldReceiveAtLast = draggingIndex !== null &&
                    draggingIndex !== i && draggingIndex !== i + 1;
                return (
                    <Fragment key={`${i}`}>
                        {shouldReceiveAtFirst && <SlideItemDragReceiver
                            width={thumbSize}
                            onDrop={(id) => {
                                slide.moveItem(id, i);
                            }} />}
                        <SlideItemRender index={i}
                            slideItem={item}
                            width={thumbSize}
                            onContextMenu={(e) => {
                                slide.openContextMenu(e, item);
                            }}
                            onCopy={() => {
                                slide.copiedItem = item;
                            }}
                            onDragStart={() => {
                                setDraggingIndex(i);
                            }}
                            onDragEnd={() => {
                                setDraggingIndex(null);
                            }} />
                        {shouldReceiveAtLast && <SlideItemDragReceiver
                            width={thumbSize}
                            onDrop={(id) => {
                                slide.moveItem(id, i);
                            }} />}
                    </Fragment>
                );
            })}
            {Array.from({ length: 2 }, (_, i) => {
                return (
                    <SlideItemGhost key={`${i}`}
                        width={thumbSize} />
                );
            })}
        </div>
    );
}
