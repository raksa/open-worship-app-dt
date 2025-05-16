import BibleItem from '../bible-list/BibleItem';
import LookupBibleItemViewController, {
    closeEventMapper,
    ctrlShiftMetaKeys,
} from './LookupBibleItemViewController';
import { handleError } from '../helper/errorHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import BibleItemViewController from './BibleItemViewController';

enum DraggingPosEnum {
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
    const bc = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const isLeft = offsetX < bc.width / 3;
    const isRight = offsetX > (bc.width * 2) / 3;
    const isTop = offsetY < bc.height / 3;
    const isBottom = offsetY > (bc.height * 2) / 3;
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
    return allPos
        .map((suffix) => {
            const className = `receiving-child${suffix}`;
            if (event.currentTarget.classList.contains(className)) {
                event.currentTarget.classList.remove(className);
                return suffix;
            }
            return null;
        })
        .filter((suffix) => suffix !== null);
}

export function applyDragged(
    event: DragDropEventType,
    bibleItemViewCtl: BibleItemViewController,
    bibleItem: BibleItem,
) {
    const allPos = removeDraggingClass(event);
    const data = event.dataTransfer.getData('text');
    try {
        const json = JSON.parse(data);
        if (json.type === 'bibleItem') {
            const newBibleItem = BibleItem.fromJson(json.data);
            for (const pos of allPos) {
                if (pos === DraggingPosEnum.CENTER.toString()) {
                    bibleItemViewCtl.applyTargetOrBibleKey(bibleItem, newBibleItem);
                } else if (pos === DraggingPosEnum.LEFT.toString()) {
                    bibleItemViewCtl.addBibleItemLeft(bibleItem, newBibleItem);
                } else if (pos === DraggingPosEnum.RIGHT.toString()) {
                    bibleItemViewCtl.addBibleItemRight(bibleItem, newBibleItem);
                } else if (pos === DraggingPosEnum.TOP.toString()) {
                    bibleItemViewCtl.addBibleItemTop(bibleItem, newBibleItem);
                } else if (pos === DraggingPosEnum.BOTTOM.toString()) {
                    bibleItemViewCtl.addBibleItemBottom(
                        bibleItem,
                        newBibleItem,
                    );
                }
            }
        }
    } catch (error) {
        handleError(error);
    }
}

function changeEditingBibleItem(
    eventKey: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
) {
    const viewController = LookupBibleItemViewController.getInstance();
    const allBibleItems = viewController.straightBibleItems;
    if (allBibleItems.length === 0) {
        return;
    }
    const selectedIndex = viewController.selectedIndex;
    if (selectedIndex === -1) {
        return;
    }
    const arrowPosMap = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'top',
        ArrowDown: 'bottom',
    };
    const neighborBibleItems = viewController.getNeighborBibleItems(
        viewController.selectedBibleItem,
        [arrowPosMap[eventKey]],
    );
    let targetBibleItem: BibleItem | null = null;
    if (eventKey === 'ArrowUp' || eventKey === 'ArrowDown') {
        if (eventKey === 'ArrowUp') {
            targetBibleItem = neighborBibleItems.top;
        } else {
            targetBibleItem = neighborBibleItems.bottom;
        }
    } else if (eventKey === 'ArrowLeft' || eventKey === 'ArrowRight') {
        if (eventKey === 'ArrowLeft') {
            targetBibleItem = neighborBibleItems.left;
        } else {
            targetBibleItem = neighborBibleItems.right;
        }
    }
    if (targetBibleItem === null) {
        return;
    }
    viewController.editBibleItem(targetBibleItem);
}

export function useNextEditingBibleItem() {
    const eventMapperList = [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
    ].map((key) => {
        return { ...ctrlShiftMetaKeys, key };
    });
    useKeyboardRegistering(
        eventMapperList,
        (event) => {
            event.preventDefault();
            changeEditingBibleItem(event.key as any);
        },
        [],
    );
}

export function useSplitBibleItemRenderer() {
    useKeyboardRegistering(
        ['s', 'v'].map((key) => {
            return { ...ctrlShiftMetaKeys, key };
        }),
        (event) => {
            const viewController = LookupBibleItemViewController.getInstance();
            const bibleItem = viewController.selectedBibleItem;
            if (event.key.toLowerCase() === 's') {
                viewController.addBibleItemLeft(bibleItem, bibleItem);
            } else {
                viewController.addBibleItemBottom(bibleItem, bibleItem);
            }
        },
        [],
    );
}

export function closeCurrentEditingBibleItem() {
    const viewController = LookupBibleItemViewController.getInstance();
    const selectedBibleItem = viewController.selectedBibleItem;
    if (viewController.straightBibleItems.length < 2) {
        return;
    }
    viewController.deleteBibleItem(selectedBibleItem);
}

export function useCloseBibleItemRenderer() {
    useKeyboardRegistering(
        [closeEventMapper],
        (event) => {
            event.preventDefault();
            closeCurrentEditingBibleItem();
        },
        [],
    );
}
