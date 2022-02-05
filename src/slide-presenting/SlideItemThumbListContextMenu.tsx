import { useEffect } from 'react';
import { cloneObject } from '../helper/helpers';
import { SlideItemThumbType } from '../editor/slideType';
import { openItemSlideEdit } from '../editor/SlideItemEditorPopup';
import { slideListEventListener } from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { ChangeHistory } from './SlideItemThumbListMenu';
import { ContextMenuEventType, showAppContextMenu } from '../others/AppContextMenu';

export const contextObject = {
    paste: () => { },
    showSlideItemContextMenu: (e: ContextMenuEventType) => { },
    showItemThumbnailContextMenu: (e: ContextMenuEventType, data: any) => { },
};
export default function SlideItemThumbListContextMenu({
    selectedIndex,
    slideItemThumbCopied,
    undo,
    slideItemThumbs,
    setSelectedWithPath,
    setIsModifying,
    setSlideItemThumbs,
    setSetSlideItemThumbCopied,
    setUndo,
    setRedo,
}: {
    selectedIndex: number | null,
    slideItemThumbCopied: number | null,
    undo: ChangeHistory[],
    slideItemThumbs: SlideItemThumbType[],
    setSelectedWithPath: (i: number | null) => void,
    setIsModifying: (b: boolean) => void
    setSlideItemThumbs: (newItemThumbs: SlideItemThumbType[]) => void,
    setSetSlideItemThumbCopied: (n: number | null) => void,
    setUndo: (undo: ChangeHistory[]) => void,
    setRedo: (redo: ChangeHistory[]) => void,
}) {
    const setItemsWithHistory = (oldItems: SlideItemThumbType[], newItems: SlideItemThumbType[]) => {
        setIsModifying(true);
        setSlideItemThumbs(newItems);
        setUndo([...undo, {
            items: [...oldItems],
        }]);
        setRedo([]);;
    };
    const paste = () => {
        if (slideItemThumbCopied !== null && slideItemThumbs[slideItemThumbCopied]) {
            const newItem: SlideItemThumbType = cloneObject(slideItemThumbs[slideItemThumbCopied]);
            newItem.id = `${maxId(slideItemThumbs) + 1}`;
            const newItems: SlideItemThumbType[] = [...slideItemThumbs, newItem];
            setItemsWithHistory(slideItemThumbs, newItems);
        }
    };
    const maxId = (items: SlideItemThumbType[]) => {
        const list = items.map((item) => +item.id).sort();
        return (list[list.length - 1] || 0) + 1;
    };
    const duplicate = (index: number) => {
        const newItems = slideItemThumbs.map((data) => data);
        const newItem: SlideItemThumbType = cloneObject(newItems[index]);
        newItem.id = `${maxId(slideItemThumbs) + 1}`;
        newItems.splice(index + 1, 0, newItem);
        setItemsWithHistory(slideItemThumbs, newItems);
    };
    const deleteItem = (index: number) => {
        if (index === selectedIndex) {
            setSelectedWithPath(null);
        }
        const newItems = slideItemThumbs.filter((data, i) => i !== index);
        setItemsWithHistory(slideItemThumbs, newItems);
    };
    useEffect(() => {
        contextObject.paste = paste;
        contextObject.showSlideItemContextMenu = (e: any) => {
            showAppContextMenu(e, [
                {
                    title: 'Paste', disabled: slideItemThumbCopied === null,
                    onClick: () => paste(),
                },
            ]);
        };
        contextObject.showItemThumbnailContextMenu = (e: any, data: { index: number }) => {
            showAppContextMenu(e, [
                {
                    title: 'Copy', onClick: () => {
                        setSetSlideItemThumbCopied(data.index);
                    },
                },
                {
                    title: 'Duplicate', onClick: () => {
                        duplicate(data.index);
                    },
                },
                {
                    title: 'Edit', onClick: () => {
                        const isEditing = isWindowEditingMode();
                        if (isEditing) {
                            setSelectedWithPath(data.index);
                            slideListEventListener.selectSlideItemThumb(slideItemThumbs[data.index]);
                        } else {
                            openItemSlideEdit(slideItemThumbs[data.index]);
                        }
                    },
                },
                {
                    title: 'Delete', onClick: () => {
                        deleteItem(data.index);
                    },
                },
            ]);
        };
        return () => {
            contextObject.paste = () => { };
            contextObject.showSlideItemContextMenu = () => { };
            contextObject.showItemThumbnailContextMenu = () => { };
        };
    });

    return (<></>);
}
