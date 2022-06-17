import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { WindowEnum } from '../event/WindowEventListener';
import {
    useThumbSizing,
} from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { Fragment, useEffect, useState } from 'react';
import SlideItemsController, { useRefresh } from './SlideItemsController';
import SlideItemThumbRender, {
    DragReceiver, ItemThumbGhost,
} from './SlideItemThumbIFrame';
import {
    THUMB_WIDTH_SETTING_NAME,
    DEFAULT_THUMB_SIZE,
} from './SlideItemsControllerBase';
import { usePresentFGClearing } from '../event/PresentEventListener';

export default function SlideItemThumbListItems({ controller }: {
    controller: SlideItemsController,
}) {
    const [thumbSize] = useThumbSizing(THUMB_WIDTH_SETTING_NAME, DEFAULT_THUMB_SIZE);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    useRefresh(controller);
    usePresentFGClearing(() => {
        controller.selectedItem = null;
    });
    if (!isWindowEditingMode()) {
        const arrows = [KeyEnum.ArrowRight, KeyEnum.ArrowLeft];
        const arrowListener = (e: KeyboardEvent) => {
            const selectedIndex = controller.selectedIndex;
            if (~selectedIndex) {
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
                controller.selectedIndex = ind;
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
                const shouldReceiveAtLeft = draggingIndex !== null &&
                    draggingIndex !== 0 && i === 0;
                const shouldReceiveAtRight = draggingIndex !== null &&
                    draggingIndex !== i && draggingIndex !== i + 1;
                return (
                    <Fragment key={`${i}`}>
                        {shouldReceiveAtLeft && <DragReceiver
                            onDrop={(id) => {
                                controller.move(id, i);
                            }} />}
                        <SlideItemThumbRender
                            isActive={item.isSelected}
                            index={i}
                            slideItemThumb={item}
                            fileSource={controller.slide.fileSource}
                            onItemClick={() => {
                                if (controller.selectedItem === item) {
                                    controller.selectedItem = null;
                                } else {
                                    controller.selectedItem = item;
                                }
                            }}
                            onContextMenu={(e) => {
                                controller.openContextMenu(e, i);
                            }}
                            onCopy={() => {
                                controller.copiedItem = item;
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
            {Array.from({ length: 2 }, (_, i) => {
                return (
                    <ItemThumbGhost key={`${i}`} width={thumbSize} />
                );
            })}
        </div>
    );
}
