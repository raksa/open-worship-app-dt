import LinkToAppModal from '../app-modal/LinkToAppModal';
import { AppPopupWindowsType } from '../app-modal/helpers';

export default function SettingHeader() {
    return (
        <LinkToAppModal modalType={AppPopupWindowsType.SETTING}>
            <button className='btn btn-outline-success rotating-hover'>
                <i className='bi bi-gear-wide-connected' /> 
            </button>
        </LinkToAppModal>
    );
}
