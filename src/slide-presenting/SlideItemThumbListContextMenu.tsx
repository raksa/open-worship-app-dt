import { useEffect } from 'react';
import { openItemSlideEdit } from '../editor/SlideItemEditorPopup';
import { isWindowEditingMode } from '../App';
import { ContextMenuEventType, showAppContextMenu } from '../others/AppContextMenu';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import SlideThumbsController from './SlideThumbsController';

export const contextObject = {
    paste: () => { },
    showSlideItemContextMenu: (e: ContextMenuEventType) => { },
    showItemThumbnailContextMenu: (e: ContextMenuEventType, data: any) => { },
};
export default function SlideItemThumbListContextMenu({ controller }: {
    controller: SlideThumbsController,
}) {
    useEffect(() => {
        contextObject.paste = () => controller.paste();
        contextObject.showSlideItemContextMenu = (e: any) => {
            showAppContextMenu(e, [{
                title: 'Paste', disabled: controller.copiedIndex === null,
                onClick: () => controller.paste(),
            }]);
        };
        contextObject.showItemThumbnailContextMenu = (e: any, data: { index: number }) => {
            showAppContextMenu(e, [
                {
                    title: 'Copy', onClick: () => {
                        controller.copiedIndex = data.index;
                    },
                },
                {
                    title: 'Duplicate', onClick: () => {
                        controller.duplicate(data.index);
                    },
                },
                {
                    title: 'Edit', onClick: () => {
                        const isEditing = isWindowEditingMode();
                        const thumbController = controller.getThumbControllerByIndex(data.index);
                        if (thumbController !== null) {
                            if (isEditing) {
                                controller.select(data.index);
                                slideListEventListenerGlobal.selectSlideItemThumb(thumbController.item);
                            } else {
                                openItemSlideEdit(thumbController.item);
                            }
                        }
                    },
                },
                {
                    title: 'Delete', onClick: () => {
                        controller.deleteItem(data.index);
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
