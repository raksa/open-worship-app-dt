import SlideItemThumb, { DragReceiver, ItemThumbGhost } from './SlideItemThumb';
import { KeyEnum, useKeyboardRegistering } from '../event/KeyboardEventListener';
import { WindowEnum } from '../event/WindowEventListener';
import { SlideItemThumbType } from '../helper/slideType';
import {
    slideListEventListener,
    useSlideItemThumbUpdating
} from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { contextObject } from './SlideItemThumbListContextMenu';
import { Fragment, useState } from 'react';

export default function SlideItemThumbListItems({
    thumbWidth,
    slideItemThumbs,
    selectedIndex,
    setSelectedWithPath,
    setSetSlideItemThumbCopied,
    setSlideItemThumbs,
}: {
    thumbWidth: number,
    slideItemThumbs: SlideItemThumbType[],
    selectedIndex: number | null,
    setSelectedWithPath: (i: number) => void
    setSetSlideItemThumbCopied: (i: number) => void
    setSlideItemThumbs: (slideItemThumbs: SlideItemThumbType[]) => void,
}) {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    useSlideItemThumbUpdating((itemThumb) => {
        itemThumb.isEditing = true;
        const slideThumbList = slideItemThumbs.map((item) => {
            if (item.id === itemThumb.id) {
                return itemThumb
            }
            return item;
        });
        setSlideItemThumbs(slideThumbList);
    });
    if (!isWindowEditingMode()) {
        const arrows = [KeyEnum.ArrowRight, KeyEnum.ArrowLeft];
        const arrowListener = (e: KeyboardEvent) => {
            if (selectedIndex === null) {
                return;
            }
            const length = slideItemThumbs.length;
            if (length) {
                let ind = e.key === KeyEnum.ArrowLeft ? selectedIndex - 1 : selectedIndex + 1;
                if (ind >= length) {
                    ind = 0;
                } else if (ind < 0) {
                    ind = length - 1;
                }
                setSelectedWithPath(+ind);
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
    const move = (id: string, toIndex: number) => {
        const fromIndex = slideItemThumbs.findIndex((item) => item.id === id) as number;
        const newList = [...slideItemThumbs];
        const target = newList.splice(fromIndex, 1)[0];
        newList.splice(toIndex, 0, target);
        setSlideItemThumbs(newList);
        slideListEventListener.ordering();
    };
    return (
        <div className='d-flex flex-wrap justify-content-center'>
            {slideItemThumbs.map((data, i) => {
                const shouldReceiveAtLeft = draggingIndex !== null && draggingIndex !== 0 && i === 0;
                const shouldReceiveAtRight = draggingIndex !== null && draggingIndex !== i && draggingIndex !== i + 1;
                return (
                    <Fragment key={`${i}`}>
                        {shouldReceiveAtLeft && <DragReceiver onDrop={(id) => {
                            move(id, i);
                        }} />}
                        <SlideItemThumb
                            isActive={i === selectedIndex}
                            index={i}
                            data={data}
                            onItemClick={() => {
                                slideListEventListener.selectSlideItemThumb(data);
                                setSelectedWithPath(i);
                            }}
                            onContextMenu={(e) => {
                                contextObject.showItemThumbnailContextMenu(e, { index: i });
                            }}
                            onCopy={() => setSetSlideItemThumbCopied(i)}
                            width={thumbWidth}
                            onDragStart={() => {
                                setDraggingIndex(i);
                            }}
                            onDragEnd={() => {
                                setDraggingIndex(null);
                            }}
                        />
                        {shouldReceiveAtRight && <DragReceiver onDrop={(id) => {
                            move(id, i);
                        }} />}
                    </Fragment>
                );
            })}
            {Array.from({ length: 2 }, (_, i) => <ItemThumbGhost key={`${i}`} width={thumbWidth} />)}
        </div>
    );
}
