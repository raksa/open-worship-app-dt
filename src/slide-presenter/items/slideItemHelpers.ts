import ScreenSlideManager from '../../_screen/ScreenSlideManager';
import { genScreenMouseEvent } from '../../_screen/screenHelpers';
import SlideItem from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';

export function getPresenterIndex(filePath: string, slideItemIds: number[]) {
    if (slideItemIds.length === 0) {
        return -1;
    }
    for (let i = 0; i < slideItemIds.length; i++) {
        const selectedList = ScreenSlideManager.getDataList(
            filePath, slideItemIds[i],
        );
        if (selectedList.length > 0) {
            return i;
        }
    }
    return -1;
}
export function handleSlideItemSelecting(
    selectSelectedSlideItem: (newSelectedSlideItem: SlideItem) => void,
    slideItem: SlideItem, event: any,
) {
    if (appProvider.isPageEditor) {
        selectSelectedSlideItem(slideItem);
    } else {
        ScreenSlideManager.handleSlideSelecting(
            event, slideItem.filePath, slideItem.toJson(),
        );
    }
}

export function genSlideItemIds(slideItems: SlideItem[]) {
    return slideItems.map((item) => {
        return item.id;
    });
}

export const DIV_CLASS_NAME = 'app-slide-items-comp';

function getSelectedSlideItemIndex(slideItems: SlideItem[]) {
    if (!document.activeElement?.classList.contains(DIV_CLASS_NAME)) {
        return -1;
    }
    const divSelected = document.activeElement.querySelector(
        '[data-slide-item-id].highlight-selected');
    const selectedSlideItemId = parseInt(
        divSelected?.getAttribute('data-slide-item-id') ?? '',
    );
    if (isNaN(selectedSlideItemId)) {
        return -1;
    }
    return slideItems.findIndex((slideItem) => {
        return slideItem.id === selectedSlideItemId;
    });
}
export function genArrowListener(
    selectSelectedSlideItem: (newSelectedSlideItem: SlideItem) => void,
    slideItems: SlideItem[],
) {
    return (event: KeyboardEvent) => {
        if (!document.activeElement?.classList.contains(DIV_CLASS_NAME)) {
            return;
        }
        const divSelected = document.activeElement.querySelector(
            '[data-slide-item-id].highlight-selected',
        );
        const selectedSlideItemId = parseInt(
            divSelected?.getAttribute('data-slide-item-id') ?? '',
        );
        if (isNaN(selectedSlideItemId)) {
            return;
        }
        let presenterIndex = getSelectedSlideItemIndex(slideItems);
        if (presenterIndex === -1) {
            return;
        }
        event.preventDefault();
        presenterIndex += (event.key === 'ArrowLeft' ? -1 : 1);
        presenterIndex = Math.max(
            0, Math.min(slideItems.length - 1, presenterIndex),
        );
        const targetSlideItem = slideItems[presenterIndex];
        handleSlideItemSelecting(
            selectSelectedSlideItem, targetSlideItem,
            genScreenMouseEvent() as any,
        );
        document.activeElement.querySelector(
            `[data-slide-item-id="${targetSlideItem.id}"]`,
        )?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    };
}
