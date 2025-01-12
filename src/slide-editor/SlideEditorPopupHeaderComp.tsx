import { ModalCloseButton } from '../app-modal/Modal';
import { tran } from '../lang';
import { closeSlideQuickEdit } from '../app-document-presenter/SlideEditHandlerComp';

export default function SlideEditorPopupHeaderComp() {
    return (
        <div className="card-header text-center w-100">
            <span>
                <i className="bi bi-pencil-square" />
                {tran('edit-item-thumb')}
            </span>
            <ModalCloseButton close={closeSlideQuickEdit} />
        </div>
    );
}
