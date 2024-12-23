import ScreenSlideManager from '../../_screen/ScreenSlideManager';
import { genScreenMouseEvent } from '../../_screen/screenHelpers';
import SlideItem from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';
import ScreenManager from '../../_screen/ScreenManager';

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
    slideItem: SlideItem, event: any, screenId?: number,
) {
    if (appProvider.isPageEditor) {
        selectSelectedSlideItem(slideItem);
    } else if (screenId !== undefined) {
        (
            ScreenManager.getInstance(screenId)?.screenSlideManager
                .handleSlideSelecting(
                    slideItem.filePath, slideItem.toJson(),
                )
        );
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

function handleSlideItemArrowKey(
    event: KeyboardEvent,
    selectSelectedSlideItem: (newSelectedSlideItem: SlideItem) => void,
    slideItems: SlideItem[], divContainer: HTMLDivElement,
    slideItemId: number, screenId: number,
) {
    let index = slideItems.findIndex((slideItem) => {
        return slideItem.id === slideItemId;
    });
    if (index === -1) {
        return;
    }
    event.preventDefault();
    index += (event.key === 'ArrowLeft' ? -1 : 1);
    index += slideItems.length;
    const targetSlideItem = slideItems[index % slideItems.length];
    handleSlideItemSelecting(
        selectSelectedSlideItem, targetSlideItem,
        genScreenMouseEvent() as any, screenId,
    );
    divContainer.querySelector(
        `[data-slide-item-id="${targetSlideItem.id}"]`,
    )?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
export function genArrowListener(
    selectSelectedSlideItem: (newSelectedSlideItem: SlideItem) => void,
    slideItems: SlideItem[],
) {
    return (event: KeyboardEvent) => {
        if (!document.activeElement?.classList.contains(DIV_CLASS_NAME)) {
            return;
        }
        const divSelectedList = document.activeElement.querySelectorAll(
            '[data-slide-item-id].highlight-selected',
        );
        const foundList = Array.from(divSelectedList).reduce(
            (r: {
                slideItemId: number, screenId: number,
            }[], divSelected) => {
                const slideItemId = parseInt(
                    divSelected?.getAttribute('data-slide-item-id') ?? '',
                );
                const screenIds = Array.from(
                    divSelected.querySelectorAll('[data-screen-id]')
                ).map((element) => {
                    return parseInt(
                        element.getAttribute('data-screen-id') ?? '',
                    );
                });
                return r.concat(screenIds.map((screenId) => {
                    return { slideItemId, screenId };
                }));
            }, [],
        );
        for (let i = 0; i < foundList.length; i++) {
            const { slideItemId, screenId } = foundList[i];
            setTimeout(() => {

                handleSlideItemArrowKey(
                    event, selectSelectedSlideItem, slideItems,
                    document.activeElement as HTMLDivElement,
                    slideItemId, screenId
                );
            }, i * 10);
        }
    };
}
