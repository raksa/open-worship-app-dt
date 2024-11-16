import Slide from '../../slide-list/Slide';
import PresentSlideManager from '../../_present/PresentSlideManager';
import { genPresentMouseEvent } from '../../_present/presentHelpers';
import SlideItem from '../../slide-list/SlideItem';
import { checkIsWindowEditingMode } from '../../router/routeHelpers';

export function getPresentingIndex(slide: Slide) {
    for (let i = 0; i < slide.items.length; i++) {
        const selectedList = PresentSlideManager.getDataList(
            slide.filePath, slide.items[i].id);
        if (selectedList.length > 0) {
            return i;
        }
    }
    return -1;
}
export function handleSlideItemSelecting(slideItem: SlideItem, event: any) {
    if (checkIsWindowEditingMode()) {
        slideItem.isSelected = !slideItem.isSelected;
    } else {
        PresentSlideManager.slideSelect(
            slideItem.filePath, slideItem.toJson(), event,
        );
    }
}

export function checkSlideItemToView(slide: Slide, element: HTMLElement) {
    if (slide.itemIdShouldToView < 0) {
        return;
    }
    setTimeout(() => {
        const parentElement = element.parentElement as HTMLElement;
        parentElement.scrollTo({
            top: parentElement.scrollHeight,
            behavior: 'smooth',
        });
        slide.itemIdShouldToView = -1;
    }, 0);
}
export const genArrowListener = (slide: Slide, slideItems: SlideItem[]) => {
    return (event: KeyboardEvent) => {
        const presentingIndex = getPresentingIndex(slide);
        if (presentingIndex === -1) {
            return;
        }
        const length = slideItems.length;
        if (length) {
            let ind = event.key === 'ArrowLeft' ?
                presentingIndex - 1 : presentingIndex + 1;
            if (ind >= length) {
                ind = 0;
            } else if (ind < 0) {
                ind = length - 1;
            }
            handleSlideItemSelecting(slideItems[ind],
                genPresentMouseEvent() as any);
        }
    };
};
