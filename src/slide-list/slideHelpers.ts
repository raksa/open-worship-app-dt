import { useState, useEffect } from 'react';
import { isWindowEditingMode } from '../App';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { showAppContextMenu } from '../others/AppContextMenu';
import { openItemSlideEdit } from '../slide-editor/SlideItemEditorPopup';
import Slide from './Slide';
import SlideItem from './SlideItem';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 0.2;
export const MAX_THUMBNAIL_SCALE = 3;
export const DEFAULT_THUMBNAIL_SIZE = 250;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenting-item-thumbnail-size';

export type ChangeHistory = { items: SlideItem[] };

export function toScaleThumbSize(isUp: boolean, currentScale: number) {
    let newScale = currentScale + (isUp ? -1 : 1) * THUMBNAIL_SCALE_STEP;
    if (newScale < MIN_THUMBNAIL_SCALE) {
        newScale = MIN_THUMBNAIL_SCALE;
    }
    if (newScale > MAX_THUMBNAIL_SCALE) {
        newScale = MAX_THUMBNAIL_SCALE;
    }
    return newScale;
}

export function useRefresh(slide: Slide) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const fileSource = slide.fileSource;
        const deleteEvents = fileSource.registerEventListener(['update'], () => {
            setN(n + 1);
        });
        return () => {
            fileSource.unregisterEventListener(deleteEvents);
        };
    });
}

export const openSlideContextMenu = (e: any,
    slide: Slide, index: number) => {
    showAppContextMenu(e, [
        {
            title: 'Copy', onClick: () => {
                SlideItem.copiedItem = slide.items[index] || null;
            },
        },
        {
            title: 'Duplicate', onClick: () => {
                slide.duplicate(index);
            },
        },
        {
            title: 'Quick Edit', onClick: () => {
                const isEditing = isWindowEditingMode();
                const item = slide.getItemByIndex(index);
                if (item !== null) {
                    if (isEditing) {
                        slideListEventListenerGlobal.selectSlideItem(item);
                    } else {
                        openItemSlideEdit(item);
                    }
                }
            },
        },
        {
            title: 'Delete', onClick: () => {
                slide.delete(index);
            },
        },
    ]);
};
