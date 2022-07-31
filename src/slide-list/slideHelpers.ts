import { useState, useEffect } from 'react';
import { isWindowEditingMode } from '../App';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import FileSource, { FSEventType } from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';
import { openItemSlideEdit } from '../slide-editor/SlideItemEditorPopup';
import Slide from './Slide';
import SlideItem from './SlideItem';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 0.2;
export const MAX_THUMBNAIL_SCALE = 3;
export const DEFAULT_THUMBNAIL_SIZE = 250;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenting-item-thumbnail-size';

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

export function openSlideContextMenu(e: any,
    slide: Slide, slideItem: SlideItem) {
    showAppContextMenu(e, [
        {
            title: 'Copy', onClick: () => {
                SlideItem.copiedItem = slideItem;
            },
        },
        {
            title: 'Duplicate', onClick: () => {
                slide.duplicateItem(slideItem);
            },
        },
        {
            title: 'Quick Edit', onClick: () => {
                const isEditing = isWindowEditingMode();
                if (isEditing) {
                    slideListEventListenerGlobal.selectSlideItem(slideItem);
                } else {
                    openItemSlideEdit(slideItem);
                }
            },
        },
        {
            title: 'Delete', onClick: () => {
                slide.deleteItem(slideItem);
            },
        },
    ]);
}
