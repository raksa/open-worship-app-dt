import { useContext } from 'react';

import { CloseButtonContext } from '../app-modal/Modal';
import { tran } from '../lang';

export default function SlideItemEditorPopupHeader() {
    const closeButton = useContext(CloseButtonContext);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-pencil-square' />
                {tran('edit-item-thumb')}
            </span>
            {closeButton}
        </div>
    );
}
