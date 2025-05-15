import Bible from './Bible';
import BibleItem from './BibleItem';
import ItemReadErrorComp from '../others/ItemReadErrorComp';
import { useFileSourceRefreshEvents } from '../helper/dirSourceHelpers';
import {
    genRemovingAttachedBackgroundMenu,
    handleDragStart,
    onDropHandling,
    useAttachedBackgroundData,
} from '../helper/dragHelpers';
import ItemColorNoteComp from '../others/ItemColorNoteComp';
import { BibleSelectionMiniComp } from '../bible-lookup/BibleSelectionComp';
import ScreenBibleManager from '../_screen/managers/ScreenBibleManager';
import { openBibleItemContextMenu } from './bibleItemHelpers';
import { useShowBibleLookupContext } from '../others/commonButtons';
import appProvider from '../server/appProvider';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import { useMemo } from 'react';
import { changeDragEventStyle } from '../helper/helpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';
import BibleViewTitleEditorComp from '../bible-reader/BibleViewTitleEditorComp';

function genAttachBackgroundComponent(
    droppedData: DroppedDataType | null | undefined,
) {
    if (droppedData === null || droppedData === undefined) {
        return null;
    }
    let element = null;
    if (droppedData.type === DragTypeEnum.BACKGROUND_COLOR) {
        element = (
            <button
                className="btn btn-secondary btn-sm"
                title={droppedData.item}
            >
                <i
                    className="bi bi-filter-circle-fill"
                    style={{
                        color: droppedData.item,
                    }}
                />
            </button>
        );
    } else if (droppedData.type === DragTypeEnum.BACKGROUND_IMAGE) {
        element = (
            <button
                className="btn btn-secondary btn-sm"
                title={droppedData.item.src}
            >
                <i className="bi bi-image" />
            </button>
        );
    } else if (droppedData.type === DragTypeEnum.BACKGROUND_VIDEO) {
        element = (
            <button
                className="btn btn-secondary btn-sm"
                title={droppedData.item.src}
            >
                <i className="bi bi-file-earmark-play-fill" />
            </button>
        );
    }
    // TODO: show bg on button click
    return element;
}

async function getBible(bibleItem: BibleItem) {
    return bibleItem.filePath
        ? await Bible.fromFilePath(bibleItem.filePath)
        : null;
}

export default function BibleItemRenderComp({
    index,
    bibleItem,
    warningMessage,
    filePath,
}: Readonly<{
    index: number;
    bibleItem: BibleItem;
    warningMessage?: string;
    filePath: string;
}>) {
    const showBibleLookupPopup = useShowBibleLookupContext();
    useFileSourceRefreshEvents(['select'], filePath);
    const changeBible = async (newBibleKey: string) => {
        const bible = await getBible(bibleItem);
        if (bible === null) {
            return;
        }
        bibleItem.bibleKey = newBibleKey;
        bibleItem.save(bible);
    };
    const attachedBackgroundData = useAttachedBackgroundData(
        filePath,
        bibleItem.id.toString(),
    );
    const attachedBackgroundElement = useMemo(() => {
        return genAttachBackgroundComponent(attachedBackgroundData);
    }, [attachedBackgroundData]);
    const handleOpening = (event: any) => {
        if (appProvider.isPagePresenter) {
            ScreenBibleManager.handleBibleItemSelecting(event, bibleItem);
        } else if (appProvider.isPageReader) {
            const lookupViewController =
                LookupBibleItemViewController.getInstance();
            if (event.shiftKey) {
                lookupViewController.addBibleItemRight(
                    lookupViewController.selectedBibleItem,
                    bibleItem,
                );
            } else {
                lookupViewController.setLookupContentFromBibleItem(bibleItem);
            }
        }
    };
    const handleContextMenuOpening = (event: React.MouseEvent<any>) => {
        const menuItems: ContextMenuItemType[] = [
            {
                menuTitle: '(*T) Open',
                onSelect: (event) => {
                    handleOpening(event);
                },
            },
        ];
        if (attachedBackgroundData) {
            menuItems.push(
                ...genRemovingAttachedBackgroundMenu(
                    filePath,
                    bibleItem.id.toString(),
                ),
            );
        }
        openBibleItemContextMenu(
            event,
            bibleItem,
            index,
            showBibleLookupPopup,
            menuItems,
        );
    };

    if (bibleItem.isError) {
        return <ItemReadErrorComp onContextMenu={handleContextMenuOpening} />;
    }

    return (
        <li
            className="list-group-item item pointer px-1"
            title="Double click to view"
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, bibleItem);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                changeDragEventStyle(event, 'opacity', '0.5');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                changeDragEventStyle(event, 'opacity', '1');
            }}
            onDrop={(event) => {
                onDropHandling(event, {
                    filePath,
                    id: bibleItem.id,
                });
            }}
            onDoubleClick={handleOpening}
            onContextMenu={handleContextMenuOpening}
        >
            <div className="d-flex">
                <ItemColorNoteComp item={bibleItem} />
                <div className="d-flex flex-fill">
                    <div className="px-1">
                        <BibleSelectionMiniComp
                            bibleKey={bibleItem.bibleKey}
                            onBibleKeyChange={(_, newValue) => {
                                changeBible(newValue);
                            }}
                            isMinimal
                        />
                    </div>
                    <span
                        className="app-ellipsis"
                        data-bible-key={bibleItem.bibleKey}
                    >
                        <BibleViewTitleEditorComp
                            bibleItem={bibleItem}
                            onTargetChange={async (newBibleTarget) => {
                                const bible = await getBible(bibleItem);
                                if (bible === null) {
                                    return;
                                }
                                bibleItem.target = newBibleTarget;
                                bibleItem.save(bible);
                            }}
                        />
                    </span>
                    {warningMessage && (
                        <span className="float-end" title={warningMessage}>
                            ⚠️
                        </span>
                    )}
                </div>
                <div className="float-end">{attachedBackgroundElement}</div>
            </div>
        </li>
    );
}
