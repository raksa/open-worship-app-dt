import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { WindowEnum } from '../event/WindowEventListener';
import {
    useSlideItemSizing,
} from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { Fragment, useState } from 'react';
import SlideItemsController, {
    useRefresh,
} from './SlideItemsController';
import SlideItemRender from './SlideItemRender';
import {
    THUMBNAIL_WIDTH_SETTING_NAME,
    DEFAULT_THUMBNAIL_SIZE,
} from './SlideItemsControllerBase';
import { usePresentFGClearing } from '../event/PresentEventListener';
import SlideItemGhost from './SlideItemGhost';
import SlideItemDragReceiver from './SlideItemDragReceiver';

export default function SlideItemsPreviewer({ controller }: {
    controller: SlideItemsController,
}) {
    const [thumbSize] = useSlideItemSizing(THUMBNAIL_WIDTH_SETTING_NAME, DEFAULT_THUMBNAIL_SIZE);
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
                        {shouldReceiveAtLeft && <SlideItemDragReceiver
                            onDrop={(id) => {
                                controller.move(id, i);
                            }} />}
                        <SlideItemRender
                            isActive={item.isSelected}
                            index={i}
                            slideItem={item}
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
                        {shouldReceiveAtRight && <SlideItemDragReceiver
                            onDrop={(id) => {
                                controller.move(id, i);
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
