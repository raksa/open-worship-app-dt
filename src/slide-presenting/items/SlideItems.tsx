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
import SlideItemGhost from './SlideItemGhost';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import Slide from '../../slide-list/Slide';
import { useFSEvents } from '../../helper/dirSourceHelpers';
import PresentSlideManager from '../../_present/PresentSlideManager';
import { genPresentMouseEvent } from '../../_present/presentHelpers';
import SlideItem from '../../slide-list/SlideItem';
import SlideItemPdfRender from './SlideItemPdfRender';

function getPresentingIndex(slide: Slide) {
    for (let i = 0; i < slide.items.length; i++) {
        const selectedList = PresentSlideManager.getDataList(
            slide.fileSource.filePath, slide.items[i].id);
        if (selectedList.length > 0) {
            return i;
        }
    }
    return -1;
}
function handleSlideItemSelecting(slideItem: SlideItem, event: any) {
    if (isWindowEditingMode()) {
        slideItem.isSelected = !slideItem.isSelected;
    } else {
        PresentSlideManager.slideSelect(slideItem.fileSource.filePath,
            slideItem.toJson(), event);
    }
}

export default function SlideItems({ slide }: { slide: Slide }) {
    const [thumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME,
        DEFAULT_THUMBNAIL_SIZE);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    useFSEvents(['select', 'edit'], slide.fileSource);
    const slideItems = slide.items;
    if (!isWindowEditingMode()) {
        const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];
        const arrowListener = (event: KeyboardEvent) => {
            const presentingIndex = getPresentingIndex(slide);
            if (presentingIndex === -1) {
                return;
            }
            const length = slideItems.length;
            if (length) {
                let ind = event.key === 'ArrowLeft' ?
                    presentingIndex - 1 : presentingIndex + 1;
                if (ind >= length) {
                    ind = 0;
                } else if (ind < 0) {
                    ind = length - 1;
                }
                handleSlideItemSelecting(slideItems[ind],
                    genPresentMouseEvent() as any);
            }
        };
        const useCallback = (key: KeyboardType) => {
            useKeyboardRegistering({ key }, arrowListener);
        };
        arrows.forEach(useCallback);
    }
    return (
        <div className='d-flex flex-wrap justify-content-center'
            ref={(element) => {
                if (!element || slide.itemIdShouldToView < 0) {
                    return;
                }
                setTimeout(() => {
                    const parentElement = element.parentElement as HTMLElement;
                    parentElement.scrollTo({
                        top: parentElement.scrollHeight,
                        behavior: 'smooth',
                    });
                    slide.itemIdShouldToView = -1;
                }, 0);
            }}>
            {slideItems.map((slideItem, i) => {
                if (slideItem.isPdf) {
                    return (
                        <SlideItemPdfRender key={i}
                            onClick={(event) => {
                                handleSlideItemSelecting(slideItem, event);
                            }}
                            slideItem={slideItem}
                            width={thumbSize} index={i} />
                    );
                }
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
                            slideItem={slideItem}
                            width={thumbSize}
                            onClick={(event) => {
                                handleSlideItemSelecting(slideItem, event);
                            }}
                            onContextMenu={(event) => {
                                slide.openContextMenu(event, slideItem);
                            }}
                            onCopy={() => {
                                slide.copiedItem = slideItem;
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
