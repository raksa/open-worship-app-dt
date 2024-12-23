import Slide from '../../slide-list/Slide';
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

function checkIsSameSlideItemIds(
    slideItemIds1: number[], slideItemIds2: number[],
) {
    slideItemIds1.sort((a, b) => {
        return a - b;
    });
    slideItemIds2.sort((a, b) => {
        return a - b;
    });
    return slideItemIds1.join(',') === slideItemIds2.join(',');
}

export const DIV_CLASS_NAME = 'app-slide-items-comp';

export function genArrowListener(
    selectSelectedSlideItem: (newSelectedSlideItem: SlideItem) => void,
    slide: Slide, slideItems: SlideItem[],
) {
    return (event: KeyboardEvent) => {
        const container = document.querySelector(`.${DIV_CLASS_NAME}`);
        if (
            !(container instanceof HTMLDivElement) ||
            document.activeElement !== container
        ) {
            return;
        }
        const divSlideItemIds = Array.from(
            container.querySelectorAll('[data-slide-item-id]'),
        ).map((el) => {
            return parseInt(el.getAttribute('data-slide-item-id') || '', 10);
        }).filter((id) => {
            return !isNaN(id);
        });
        const slideItemIds = genSlideItemIds(slideItems);
        if (!checkIsSameSlideItemIds(divSlideItemIds, slideItemIds)) {
            return;
        }
        event.preventDefault();
        const presenterIndex = getPresenterIndex(
            slide.filePath, divSlideItemIds,
        );
        if (presenterIndex === -1) {
            return;
        }
        let ind = event.key === 'ArrowLeft' ?
            presenterIndex - 1 : presenterIndex + 1;
        if (ind >= slideItems.length) {
            ind = 0;
        } else if (ind < 0) {
            ind = slideItems.length - 1;
        }
        handleSlideItemSelecting(
            selectSelectedSlideItem,
            slideItems[ind], genScreenMouseEvent() as any,
        );
    };
}
