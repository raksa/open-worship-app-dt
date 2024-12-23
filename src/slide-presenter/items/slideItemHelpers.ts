import ScreenSlideManager from '../../_screen/ScreenSlideManager';
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

function findNextSlideItem(
    isLeft: boolean, slideItems: SlideItem[], slideItemId: number,
    divContainer: HTMLDivElement,
) {
    let index = slideItems.findIndex((slideItem) => {
        return slideItem.id === slideItemId;
    });
    if (index === -1) {
        return { targetSlideItem: null, targetDiv: null };
    }
    index += isLeft ? -1 : 1;
    index += slideItems.length;

    const targetSlideItem = slideItems[index % slideItems.length] ?? null;
    return {
        targetSlideItem,
        targetDiv: targetSlideItem === null ? null : divContainer.querySelector(
            `[data-slide-item-id="${targetSlideItem.id}"]`,
        ) as HTMLDivElement,
    };
}
export function handleArrowing(event: KeyboardEvent, slideItems: SlideItem[]) {
    if (
        !appProvider.presenterHomePage ||
        !document.activeElement?.classList.contains(DIV_CLASS_NAME)
    ) {
        return;
    }
    const isLeft = event.key === 'ArrowLeft';
    const divSelectedList = document.activeElement.querySelectorAll(
        '[data-slide-item-id].highlight-selected',
    );
    const foundList = Array.from(divSelectedList).reduce(
        (r: {
            slideItem: SlideItem, targetDiv: HTMLDivElement,
            screenId: number,
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
            const { targetSlideItem, targetDiv } = findNextSlideItem(
                isLeft, slideItems, slideItemId,
                document.activeElement as HTMLDivElement,
            );
            if (targetSlideItem === null || targetDiv === null) {
                return r;
            }
            return r.concat(screenIds.map((screenId) => {
                return { slideItem: targetSlideItem, targetDiv, screenId };
            }));
        }, [],
    );
    if (foundList.length === 0) {
        return;
    }
    event.preventDefault();
    // FIXME: monitor group not working
    for (let i = 0; i < foundList.length; i++) {
        const { slideItem, targetDiv, screenId } = foundList[i];
        const screenManager = ScreenManager.getInstance(screenId);
        if (screenManager === null) {
            continue;
        }
        setTimeout(() => {
            screenManager.screenSlideManager.handleSlideSelecting(
                slideItem.filePath, slideItem.toJson(),
            );
            targetDiv.scrollIntoView({
                behavior: 'smooth', block: 'center',
            });
        }, i * 100);
    }
}