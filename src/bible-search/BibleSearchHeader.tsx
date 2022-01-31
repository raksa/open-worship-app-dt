import { useTranslation } from 'react-i18next';
import {
    keyboardEventListener,
    LinuxControlEnum,
    MacControlEnum,
    useKeyboardRegistering,
    WindowsControlEnum
} from '../event/KeyboardEventListener';
import { openBibleSearch } from './BibleSearchPopup';

export default function BibleSearchHeader() {
    const { t } = useTranslation();
    const eventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: 'b',
    };
    useKeyboardRegistering(eventMapper, openBibleSearch);
    return (
        <button style={{ width: '220px' }} onClick={openBibleSearch}
            data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
            type="button" className="tool-tip tool-tip-fade btn btn-labeled btn-primary">
            <span className="btn-label">
                <i className="bi bi-book"></i>
            </span>
            {t('bible-search')}
        </button>
    );
}
