import './SlideEditorPopupComp.scss';

import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import SlideEditorPopupHeaderComp from './SlideEditorPopupHeaderComp';
import Slide from '../app-document-list/Slide';
import SlideEditorComp from './SlideEditorComp';
import { closeSlideQuickEdit } from '../app-document-presenter/SlideEditHandlerComp';
import { Modal } from '../app-modal/Modal';
import { SelectedEditingSlideContext } from '../app-document-list/appDocumentHelpers';

export default function SlideEditorPopupComp({
    slide,
}: Readonly<{
    slide: Slide;
}>) {
    useKeyboardRegistering([{ key: 'Escape' }], closeSlideQuickEdit);
    return (
        <Modal>
            <div id="slide-editor-popup" className="shadow card">
                <SlideEditorPopupHeaderComp />
                <div className="body card-body w-100 overflow-hidden">
                    <SelectedEditingSlideContext
                        value={{
                            selectedSlide: slide,
                            setSelectedSlide: () => {},
                        }}
                    >
                        <SlideEditorComp />
                    </SelectedEditingSlideContext>
                </div>
            </div>
        </Modal>
    );
}
