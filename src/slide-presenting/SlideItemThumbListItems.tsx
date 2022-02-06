import SlideItemThumb, {
    DragReceiver,
    ItemThumbGhost,
} from './SlideItemThumb';
import { KeyEnum, useKeyboardRegistering } from '../event/KeyboardEventListener';
import { WindowEnum } from '../event/WindowEventListener';
import { slideListEventListenerGlobal, useSlideItemThumbUpdating } from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { contextObject } from './SlideItemThumbListContextMenu';
import { Fragment, useState } from 'react';
import SlideThumbsController from './SlideThumbsController';

export default function SlideItemThumbListItems({ controller }: {
    controller: SlideThumbsController,
}) {
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
                controller.select(+ind);
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
            {controller.items.map((data, i) => {
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
                            data={data}
                            onItemClick={() => {
                                slideListEventListenerGlobal.selectSlideItemThumb(data);
                                controller.select(i);
                            }}
                            onContextMenu={(e) => {
                                contextObject.showItemThumbnailContextMenu(e, { index: i });
                            }}
                            onCopy={() => {
                                controller.copiedIndex = i;
                            }}
                            width={controller.thumbWidth}
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
                width={controller.thumbWidth} />)}
        </div>
    );
}
