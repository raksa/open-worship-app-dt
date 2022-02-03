import './SlideItemEditorPopup.scss';

import { KeyEnum, useKeyboardRegistering } from '../event/KeyboardEventListener';
import HeaderEditorPopup from './HeaderEditorPopup';
import { StateEnum, WindowEnum, windowEventListener } from '../event/WindowEventListener';
import Modal from '../helper/Modal';
import { SlideItemThumbEditorController } from './SlideItemThumbEditor';
import { SlideItemThumbType } from './slideType';
import { mapper } from './EditorBoxMapper';

export const openItemSlideEditEvent = {
    window: WindowEnum.ItemSlideEdit,
    state: StateEnum.Open,
};
export const closeItemSlideEditEvent = {
    window: WindowEnum.ItemSlideEdit,
    state: StateEnum.Close,
};
export const openItemSlideEdit = (slideItemThumb: SlideItemThumbType) => {
    windowEventListener.fireEvent(openItemSlideEditEvent, slideItemThumb);
};
export const closeItemSlideEdit = () => {
    const close = () => {
        windowEventListener.fireEvent(closeItemSlideEditEvent);
    }
    if (mapper.selectedBoxEditor) {
        mapper.selectedBoxEditor?.stopAllModes(close);
    } else {
        close();
    }
};

export default function SlideItemEditorPopup({ slideItemThumb }: {
    slideItemThumb: SlideItemThumbType
}) {
    useKeyboardRegistering({
        key: KeyEnum.Escape,
    }, closeItemSlideEdit);
    return (
        <Modal>
            <div id="slide-item-editor-popup"
                className="app-modal shadow card">
                <HeaderEditorPopup />
                <div className="body card-body w-100">
                    <SlideItemThumbEditorController
                        slideItemThumb={slideItemThumb} />
                </div>
            </div>
        </Modal>
    );
}
