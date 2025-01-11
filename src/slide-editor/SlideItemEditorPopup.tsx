import './SlideItemEditorPopup.scss';

import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import SlideItemEditorPopupHeader from './SlideItemEditorPopupHeader';
import Slide from '../slide-list/Slide';
import SlideItemEditorComp from './SlideItemEditorComp';
import { closeSlideItemQuickEdit } from '../slide-presenter/HandleItemSlideEdit';
import { Modal } from '../app-modal/Modal';
import { SelectedEditingSlideItemContext } from '../slide-list/appDocumentHelpers';

export default function SlideItemEditorPopup({
    slideItem,
}: Readonly<{
    slideItem: Slide;
}>) {
    useKeyboardRegistering([{ key: 'Escape' }], closeSlideItemQuickEdit);
    return (
        <Modal>
            <div id="slide-item-editor-popup" className="shadow card">
                <SlideItemEditorPopupHeader />
                <div className="body card-body w-100 overflow-hidden">
                    <SelectedEditingSlideItemContext
                        value={{
                            selectedVaryAppDocumentItem: slideItem,
                            setSelectedSlideItem: () => {},
                        }}
                    >
                        <SlideItemEditorComp />
                    </SelectedEditingSlideItemContext>
                </div>
            </div>
        </Modal>
    );
}
