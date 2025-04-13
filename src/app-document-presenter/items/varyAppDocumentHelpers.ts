import ScreenVaryAppDocumentManager from '../../_screen/managers/ScreenVaryAppDocumentManager';
import appProvider from '../../server/appProvider';
import { getScreenManagerBase } from '../../_screen/managers/screenManagerBaseHelpers';
import { screenManagerFromBase } from '../../_screen/managers/screenManagerHelpers';
import { VaryAppDocumentItemType } from '../../app-document-list/appDocumentHelpers';
import { slidePreviewerMethods } from './AppDocumentPreviewerFooterComp';

export function handleAppDocumentItemSelecting(
    event: any,
    viewIndex: number,
    varyAppDocumentItem: VaryAppDocumentItemType,
    selectSelectedSlide: (varyAppDocumentItem: VaryAppDocumentItemType) => void,
) {
    if (appProvider.isPageEditor) {
        selectSelectedSlide(varyAppDocumentItem);
    } else {
        slidePreviewerMethods.handleSlideItemSelected(
            viewIndex,
            varyAppDocumentItem,
        );
        ScreenVaryAppDocumentManager.handleSlideSelecting(
            event,
            varyAppDocumentItem.filePath,
            varyAppDocumentItem.toJson(),
        );
    }
}

export function genSlideIds(varyAppDocumentItems: VaryAppDocumentItemType[]) {
    return varyAppDocumentItems.map((item) => {
        return item.id;
    });
}

export const DIV_CLASS_NAME = 'app-slides-comp';
export const DATA_QUERY_KEY = 'data-vary-app-document-item-id';

export function showVaryAppDocumentItemInViewport(id: number) {
    setTimeout(() => {
        const querySelector = `[data-vary-app-document-item-id="${id}"]`;
        const element = document.querySelector(querySelector);
        if (element === null) {
            return;
        }
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
    }, 0);
}

function findNextSlide(
    isLeft: boolean,
    items: VaryAppDocumentItemType[],
    itemId: number,
    divContainer: HTMLDivElement,
) {
    let index = items.findIndex((item) => {
        return item.id === itemId;
    });
    if (index === -1) {
        return { targetItem: null, targetDiv: null };
    }
    index += isLeft ? -1 : 1;
    index += items.length;

    const targetItem = items[index % items.length] ?? null;
    return {
        targetItem,
        targetDiv:
            targetItem === null
                ? null
                : (divContainer.querySelector(
                      `[${DATA_QUERY_KEY}="${targetItem.id}"]`,
                  ) as HTMLDivElement),
    };
}
export function handleArrowing(
    event: KeyboardEvent,
    varyAppDocumentItems: VaryAppDocumentItemType[],
) {
    if (
        !appProvider.presenterHomePage ||
        !document.activeElement?.classList.contains(DIV_CLASS_NAME)
    ) {
        return;
    }
    const isLeft = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key);
    const divSelectedList = document.activeElement.querySelectorAll(
        `[${DATA_QUERY_KEY}].highlight-selected`,
    );
    const foundList = Array.from(divSelectedList).reduce(
        (
            r: {
                item: VaryAppDocumentItemType;
                targetDiv: HTMLDivElement;
                screenId: number;
            }[],
            divSelected,
        ) => {
            const itemId = parseInt(
                divSelected?.getAttribute(DATA_QUERY_KEY) ?? '',
            );
            const screenIds = Array.from(
                divSelected.querySelectorAll('[data-screen-id]'),
            ).map((element) => {
                return parseInt(element.getAttribute('data-screen-id') ?? '');
            });
            const { targetItem, targetDiv } = findNextSlide(
                isLeft,
                varyAppDocumentItems,
                itemId,
                document.activeElement as HTMLDivElement,
            );
            if (targetItem === null || targetDiv === null) {
                return r;
            }
            return r.concat(
                screenIds.map((screenId) => {
                    return { item: targetItem, targetDiv, screenId };
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
        const { item, targetDiv, screenId } = foundList[i];
        const screenManager = screenManagerFromBase(
            getScreenManagerBase(screenId),
        );
        if (screenManager === null) {
            continue;
        }
        setTimeout(() => {
            const { screenVaryAppDocumentManager } = screenManager;
            screenVaryAppDocumentManager.varyAppDocumentItemData =
                screenVaryAppDocumentManager.toSlideData(
                    item.filePath,
                    item.toJson(),
                );
            targetDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, i * 100);
    }
}
