import React from 'react';
import BibleItem from '../bible-list/BibleItem';
import BibleItemViewController from './BibleItemViewController';
import { handleError } from '../helper/errorHelpers';

export enum DraggingPosEnum {
    TOP = '-top',
    BOTTOM = '-bottom',
    LEFT = '-left',
    RIGHT = '-right',
    CENTER = '',
}

type DragDropEventType = React.DragEvent<HTMLDivElement>;

export function genDraggingClass(event: DragDropEventType) {
    const { nativeEvent } = event;
    const { offsetX, offsetY } = nativeEvent;
    const bc = (event.currentTarget as HTMLDivElement)
        .getBoundingClientRect();
    const isLeft = offsetX < bc.width / 3;
    const isRight = offsetX > bc.width * 2 / 3;
    const isTop = offsetY < bc.height / 3;
    const isBottom = offsetY > bc.height * 2 / 3;
    let suffix = DraggingPosEnum.CENTER.toString();
    if (isLeft) {
        suffix += DraggingPosEnum.LEFT;
    } else if (isRight) {
        suffix += DraggingPosEnum.RIGHT;
    } else if (isTop) {
        suffix += DraggingPosEnum.TOP;
    } else if (isBottom) {
        suffix += DraggingPosEnum.BOTTOM;
    }
    return `receiving-child${suffix}`;
}

export function removeDraggingClass(event: DragDropEventType) {
    const allPos = Object.values(DraggingPosEnum);
    return allPos.map((suffix) => {
        const className = `receiving-child${suffix}`;
        if (event.currentTarget.classList.contains(className)) {
            event.currentTarget.classList.remove(className);
            return suffix;
        }
        return null;
    }).filter((suffix) => suffix !== null);
}

export function applyDragged(
    event: DragDropEventType,
    bibleItemViewCtl: BibleItemViewController,
    indices: number[],
    isHorizontal: boolean
) {
    const allPos = removeDraggingClass(event);
    const data = event.dataTransfer.getData('text');
    try {
        const json = JSON.parse(data);
        if (json.type === 'bibleItem') {
            const bibleItem = BibleItem.fromJson(json.data);
            for (const pos of allPos) {
                if (pos === DraggingPosEnum.CENTER.toString()) {
                    bibleItemViewCtl.changeItemAtIndex(
                        bibleItem, indices,
                    );
                } else if (pos === DraggingPosEnum.LEFT.toString()) {
                    bibleItemViewCtl.addItemAtIndexLeft(
                        indices, bibleItem, isHorizontal,
                    );
                } else if (pos === DraggingPosEnum.RIGHT.toString()) {
                    bibleItemViewCtl.addItemAtIndexRight(
                        indices, bibleItem, isHorizontal,
                    );
                } else if (pos === DraggingPosEnum.TOP.toString()) {
                    bibleItemViewCtl.addItemAtIndexTop(
                        indices, bibleItem, isHorizontal,
                    );
                } else if (pos === DraggingPosEnum.BOTTOM.toString()) {
                    // TODO: implement
                }
            }
        }
    } catch (error) {
        handleError(error);
    }
}
