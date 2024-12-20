import Slide from '../../slide-list/Slide';
import ScreenSlideManager from '../../_screen/ScreenSlideManager';
import { genScreenMouseEvent } from '../../_screen/screenHelpers';
import SlideItem from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';

export function getPresenterIndex(slide: Slide) {
    for (let i = 0; i < slide.items.length; i++) {
        const selectedList = ScreenSlideManager.getDataList(
            slide.filePath, slide.items[i].id,
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

export function genArrowListener(
    selectSelectedSlideItem: (newSelectedSlideItem: SlideItem) => void,
    slide: Slide, slideItems: SlideItem[],
) {
    return (event: KeyboardEvent) => {
        const presenterIndex = getPresenterIndex(slide);
        if (presenterIndex === -1) {
            return;
        }
        const length = slideItems.length;
        if (length) {
            let ind = event.key === 'ArrowLeft' ?
                presenterIndex - 1 : presenterIndex + 1;
            if (ind >= length) {
                ind = 0;
            } else if (ind < 0) {
                ind = length - 1;
            }
            handleSlideItemSelecting(
                selectSelectedSlideItem,
                slideItems[ind], genScreenMouseEvent() as any,
            );
        }
    };
}
