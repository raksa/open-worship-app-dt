import SlideItemThumb, {
    DragReceiver,
    ItemThumbGhost,
} from './SlideItemThumb';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { WindowEnum } from '../event/WindowEventListener';
import {
    slideListEventListenerGlobal,
    useSlideItemThumbUpdating,
    useThumbSizing,
} from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { Fragment, useState } from 'react';
import SlideThumbsController, { DEFAULT_THUMB_SIZE, THUMB_WIDTH_SETTING_NAME } from './SlideThumbsController';
import { SlideItemThumbType } from '../helper/slideHelper';

export default function SlideItemThumbListItems({ controller }: {
    controller: SlideThumbsController,
}) {
    const [thumbSize] = useThumbSizing(THUMB_WIDTH_SETTING_NAME, DEFAULT_THUMB_SIZE);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    useSlideItemThumbUpdating((itemThumb) => {
        itemThumb.isEditing = true;
        const slideThumbList = controller.items.map((item) => {
            if (item.id === itemThumb.id) {
                return itemThumb;
            }
            return item;
        });
        controller.items = slideThumbList;
    });
    if (!isWindowEditingMode()) {
        const arrows = [KeyEnum.ArrowRight, KeyEnum.ArrowLeft];
        const arrowListener = (e: KeyboardEvent) => {
            const selectedIndex = controller.selectedIndex;
            if (selectedIndex === null) {
                return;
            }
            const length = controller.items.length;
            if (length) {
                let ind = e.key === KeyEnum.ArrowLeft ? selectedIndex - 1 : selectedIndex + 1;
                if (ind >= length) {
                    ind = 0;
                } else if (ind < 0) {
                    ind = length - 1;
                }
                controller.select((controller.getItemByIndex(+ind) as SlideItemThumbType).id);
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
            {controller.items.map((item, i) => {
                const shouldReceiveAtLeft = draggingIndex !== null && draggingIndex !== 0 && i === 0;
                const shouldReceiveAtRight = draggingIndex !== null && draggingIndex !== i && draggingIndex !== i + 1;
                return (
                    <Fragment key={`${i}`}>
                        {shouldReceiveAtLeft && <DragReceiver onDrop={(id) => {
                            controller.move(id, i);
                        }} />}
                        <SlideItemThumb
                            isActive={i === controller.selectedIndex}
                            index={i}
                            data={item}
                            onItemClick={() => {
                                slideListEventListenerGlobal.selectSlideItemThumb(item);
                                controller.select(item.id);
                            }}
                            onContextMenu={(e) => controller.showItemThumbnailContextMenu(e, i)}
                            onCopy={() => {
                                controller.copiedIndex = i;
                            }}
                            width={thumbSize}
                            onDragStart={() => {
                                setDraggingIndex(i);
                            }}
                            onDragEnd={() => {
                                setDraggingIndex(null);
                            }}
                        />
                        {shouldReceiveAtRight && <DragReceiver onDrop={(id) => {
                            controller.move(id, i);
                        }} />}
                    </Fragment>
                );
            })}
            {Array.from({ length: 2 }, (_, i) => <ItemThumbGhost key={`${i}`}
                width={thumbSize} />)}
        </div>
    );
}
