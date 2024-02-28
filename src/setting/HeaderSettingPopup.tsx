import { useContext } from 'react';
import { CloseButtonContext } from '../app-modal/Modal';

export default function HeaderSettingPopup() {
    const closeButton = useContext(CloseButtonContext);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-gear-wide-connected' />Setting
                {closeButton}
            </span>
        </div>
    );
}
