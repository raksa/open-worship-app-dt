import { useTranslation } from 'react-i18next';
import {
    keyboardEventListener,
    LinuxControlEnum,
    MacControlEnum,
    useKeyboardRegistering,
    WindowsControlEnum,
} from '../event/KeyboardEventListener';
import { closeItemSlideEdit } from './SlideItemEditorPopup';

export default function SlideItemEditorPopupHeader() {
    const { t } = useTranslation();
    const eventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: 'q',
    };
    useKeyboardRegistering(eventMapper, closeItemSlideEdit);
    return (
        <div className='card-header text-center w-100'>
            <span>
                <i className='bi bi-pencil-square'></i>
                {t('edit-item-thumb')}
            </span>
            <button type='button' onClick={closeItemSlideEdit}
                data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
                className='tool-tip tool-tip-fade tool-tip-left btn-close float-end'></button>
        </div>
    );
}
