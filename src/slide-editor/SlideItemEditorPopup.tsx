import './SlideItemEditorPopup.scss';

import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import SlideItemEditorPopupHeader from './SlideItemEditorPopupHeader';
import Modal from '../others/Modal';
import SlideItem from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import {
    closeItemSlideEdit,
} from '../slide-presenting/HandleItemSlideEdit';
import CanvasController from './canvas/CanvasController';

export default function SlideItemEditorPopup({ slideItem }: {
    slideItem: SlideItem
}) {
    useKeyboardRegistering({
        key: 'Escape',
    }, closeItemSlideEdit);
    CanvasController.getInstance().init(slideItem);
    return (
        <Modal>
            <div id='slide-item-editor-popup'
                className='app-modal shadow card'>
                <SlideItemEditorPopupHeader />
                <div className='body card-body w-100'>
                    <SlideItemEditor slideItem={slideItem} />
                </div>
            </div>
        </Modal>
    );
}
