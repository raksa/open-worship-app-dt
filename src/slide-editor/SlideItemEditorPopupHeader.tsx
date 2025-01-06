import { ModalCloseButton } from '../app-modal/Modal';
import { tran } from '../lang';
import {
    closeSlideItemQuickEdit,
} from '../slide-presenter/HandleItemSlideEdit';

export default function SlideItemEditorPopupHeader() {
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-pencil-square' />
                {tran('edit-item-thumb')}
            </span>
            <ModalCloseButton close={closeSlideItemQuickEdit} />
        </div>
    );
}
