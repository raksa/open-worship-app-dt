import './SlideItemEditorPopup.scss';

import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import SlideItemEditorPopupHeader from './SlideItemEditorPopupHeader';
import SlideItem, {
    SelectedEditingSlideItemContext,
} from '../slide-list/SlideItem';
import SlideItemEditorComp from './SlideItemEditorComp';
import {
    closeSlideItemQuickEdit,
} from '../slide-presenter/HandleItemSlideEdit';
import { Modal } from '../app-modal/Modal';

export default function SlideItemEditorPopup({ slideItem }: Readonly<{
    slideItem: SlideItem
}>) {
    useKeyboardRegistering([{ key: 'Escape' }], closeSlideItemQuickEdit);
    return (
        <Modal>
            <div id='slide-item-editor-popup'
                className='shadow card'>
                <SlideItemEditorPopupHeader />
                <div className='body card-body w-100 overflow-hidden'>
                    <SelectedEditingSlideItemContext value={{
                        selectedSlideItem: slideItem,
                        setSelectedSlideItem: () => { },
                    }}>
                        <SlideItemEditorComp />
                    </SelectedEditingSlideItemContext>
                </div>
            </div>
        </Modal>
    );
}
