import ScreenSlideManager from '../../_screen/managers/ScreenSlideManager';
import SlideItem from '../../slide-list/SlideItem';
import appProvider from '../../server/appProvider';
import { getScreenManagerBase } from '../../_screen/managers/screenManagerBaseHelpers';
import { screenManagerFromBase } from '../../_screen/managers/screenManagerHelpers';
import { slidePreviewerMethods } from './SlidePreviewerFooterComp';

export function handleSlideItemSelecting(
    event: any,
    viewIndex: number,
    slideItem: SlideItem,
    selectSelectedSlideItem: (newSelectedSlideItem: SlideItem) => void,
) {
    if (appProvider.isPageEditor) {
        selectSelectedSlideItem(slideItem);
    } else {
        slidePreviewerMethods.handleSlideItemSelected(viewIndex, slideItem);
        ScreenSlideManager.handleSlideSelecting(
            event,
            slideItem.filePath,
            slideItem.toJson(),
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
    isLeft: boolean,
    slideItems: SlideItem[],
    slideItemId: number,
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
        targetDiv:
            targetSlideItem === null
                ? null
                : (divContainer.querySelector(
                      `[data-slide-item-id="${targetSlideItem.id}"]`,
                  ) as HTMLDivElement),
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
        (
            r: {
                slideItem: SlideItem;
                targetDiv: HTMLDivElement;
                screenId: number;
            }[],
            divSelected,
        ) => {
            const slideItemId = parseInt(
                divSelected?.getAttribute('data-slide-item-id') ?? '',
            );
            const screenIds = Array.from(
                divSelected.querySelectorAll('[data-screen-id]'),
            ).map((element) => {
                return parseInt(element.getAttribute('data-screen-id') ?? '');
            });
            const { targetSlideItem, targetDiv } = findNextSlideItem(
                isLeft,
                slideItems,
                slideItemId,
                document.activeElement as HTMLDivElement,
            );
            if (targetSlideItem === null || targetDiv === null) {
                return r;
            }
            return r.concat(
                screenIds.map((screenId) => {
                    return { slideItem: targetSlideItem, targetDiv, screenId };
                }),
            );
        },
        [],
    );
    if (foundList.length === 0) {
        return;
    }
    event.preventDefault();
    for (let i = 0; i < foundList.length; i++) {
        const { slideItem, targetDiv, screenId } = foundList[i];
        const screenManager = screenManagerFromBase(
            getScreenManagerBase(screenId),
        );
        if (screenManager === null) {
            continue;
        }
        setTimeout(() => {
            const { screenSlideManager } = screenManager;
            screenSlideManager.slideItemData =
                screenSlideManager.toSlideItemData(
                    slideItem.filePath,
                    slideItem.toJson(),
                );
            targetDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, i * 100);
    }
}
