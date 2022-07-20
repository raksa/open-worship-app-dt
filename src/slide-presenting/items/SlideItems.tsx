import {
    KeyEnum,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { WindowEnum } from '../../event/WindowEventListener';
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

export default function SlideItems({ slide }: { slide: Slide }) {
    const [thumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    usePresentFGClearing(() => {
        SlideItem.setSelectedItem(null);
    });
    if (!isWindowEditingMode()) {
        const arrows = [KeyEnum.ArrowRight, KeyEnum.ArrowLeft];
        const arrowListener = (e: KeyboardEvent) => {
            const selectedIndex = slide.selectedIndex;
            if (~selectedIndex) {
                return;
            }
            const length = slide.items.length;
            if (length) {
                let ind = e.key === KeyEnum.ArrowLeft ?
                    selectedIndex - 1 : selectedIndex + 1;
                if (ind >= length) {
                    ind = 0;
                } else if (ind < 0) {
                    ind = length - 1;
                }
                slide.selectedIndex = ind;
            }
        };
        const useCallback = (key: KeyEnum) => {
            useKeyboardRegistering({
                key,
                layer: WindowEnum.Root,
            }, arrowListener);
        };
        arrows.forEach(useCallback);
    }
    return (
        <div className='d-flex flex-wrap justify-content-center'>
            {slide.items.map((item, i) => {
                const shouldReceiveAtLeft = draggingIndex !== null &&
                    draggingIndex !== 0 && i === 0;
                const shouldReceiveAtRight = draggingIndex !== null &&
                    draggingIndex !== i && draggingIndex !== i + 1;
                return (
                    <Fragment key={`${i}`}>
                        {shouldReceiveAtLeft && <SlideItemDragReceiver
                            onDrop={(id) => {
                                slide.moveItem(id, i);
                            }} />}
                        <SlideItemRender
                            index={i}
                            slideItem={item}
                            onContextMenu={(e) => {
                                slide.openContextMenu(e, item);
                            }}
                            onCopy={() => {
                                slide.copiedItem = item;
                            }}
                            width={thumbSize}
                            onDragStart={() => {
                                setDraggingIndex(i);
                            }}
                            onDragEnd={() => {
                                setDraggingIndex(null);
                            }} />
                        {shouldReceiveAtRight && <SlideItemDragReceiver
                            onDrop={(id) => {
                                slide.moveItem(id, i);
                            }} />}
                    </Fragment>
                );
            })}
            {Array.from({ length: 2 }, (_, i) => {
                return (
                    <SlideItemGhost key={`${i}`} width={thumbSize} />
                );
            })}
        </div>
    );
}
