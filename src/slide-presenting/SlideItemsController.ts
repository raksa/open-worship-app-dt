import { toastEventListener } from '../event/ToastEventListener';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { showAppContextMenu } from '../others/AppContextMenu';
import { openItemSlideEdit } from '../editor/SlideItemEditorPopup';
import { DisplayType } from '../helper/displayHelper';
import HTML2React from '../slide-editing/HTML2React';
import Slide from '../slide-list/Slide';
import SlideItemsControllerBase, {
    MAX_THUMB_SCALE, MIN_THUMB_SCALE, THUMB_SCALE_STEP,
} from './SlideItemsControllerBase';
import { useState, useEffect } from 'react';
import SlideItem from './SlideItem';

export function useRefresh(controller: SlideItemsController) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const fileSource = controller.slide.fileSource;
        const deleteEvent = fileSource.registerEventListener('refresh', () => {
            setN(n + 1);
        });
        return () => {
            fileSource.unregisterEventListener(deleteEvent);
        };
    });
}

const openContextMenu = (e: any,
    controller: SlideItemsController, index: number) => {
    showAppContextMenu(e, [
        {
            title: 'Copy', onClick: () => {
                controller.copiedItem = controller.items[index] || null;
            },
        },
        {
            title: 'Duplicate', onClick: () => {
                controller.duplicate(index);
            },
        },
        {
            title: 'Edit', onClick: () => {
                const isEditing = isWindowEditingMode();
                const item = controller.getItemByIndex(index);
                if (item !== null) {
                    if (isEditing) {
                        slideListEventListenerGlobal.selectSlideItemThumb(item);
                    } else {
                        openItemSlideEdit(item);
                    }
                }
            },
        },
        {
            title: 'Delete', onClick: () => {
                controller.delete(index);
            },
        },
    ]);
};

export default class SlideItemsController extends SlideItemsControllerBase {
    constructor(slide: Slide) {
        super(slide);
    }
    checkIsWrongDimension({ bounds }: DisplayType) {
        const found = this.items.map((item) => {
            const html2React = HTML2React.parseHTML(item.html);
            return { width: html2React.width, height: html2React.height };
        }).find(({ width, height }: { width: number, height: number }) => {
            return bounds.width !== width || bounds.height !== height;
        });
        if (found) {
            return {
                slide: found,
                display: { width: bounds.width, height: bounds.height },
            };
        }
        return null;
    }
    async fixSlideDimension({ bounds }: DisplayType) {
        this.items.forEach((item) => {
            const html2React = HTML2React.parseHTML(item.html);
            html2React.width = bounds.width;
            html2React.height = bounds.height;
            item.html = html2React.htmlString;
        });
        if (await this.slide.save()) {
            toastEventListener.showSimpleToast({
                title: 'Fix Slide Dimension',
                message: 'Slide dimension has been fixed',
            });
        } else {
            toastEventListener.showSimpleToast({
                title: 'Fix Slide Dimension',
                message: 'Unable to fix slide dimension',
            });
        }
    }
    showSlideItemContextMenu(e: any) {
        showAppContextMenu(e, [{
            title: 'New Slide Thumb', onClick: () => {
                const item = SlideItem.defaultSlideItem();
                this.add(new SlideItem(-1, item.id, item.html,
                    this.slide.fileSource));
            },
        }, {
            title: 'Paste', disabled: this.copiedItem === null,
            onClick: () => this.paste(),
        }]);
    }
    openContextMenu(e: any, index: number) {
        openContextMenu(e, this, index);
    }
    static toScaleThumbSize(isUp: boolean, currentScale: number) {
        let newScale = currentScale + (isUp ? -1 : 1) * THUMB_SCALE_STEP;
        if (newScale < MIN_THUMB_SCALE) {
            newScale = MIN_THUMB_SCALE;
        }
        if (newScale > MAX_THUMB_SCALE) {
            newScale = MAX_THUMB_SCALE;
        }
        return newScale;
    }
}
