import LinkToAppModal from '../app-modal/LinkToAppModal';
import { AppModalType } from '../app-modal/helpers';

export default function SettingHeader() {
    return (
        <LinkToAppModal modalType={AppModalType.SETTING}>
            <button className='btn btn-lg btn-outline-success rotating-hover'>
                <i className='bi bi-gear-wide-connected' /> Setting
            </button>
        </LinkToAppModal>
    );
}
