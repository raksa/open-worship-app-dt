import { openSetting } from './HandleSetting';

export default function SettingHeader() {
    return (
        <button className='btn btn-lg btn-outline-success rotating-hover'
            onClick={() => {
                openSetting();
            }}>
            <i className='bi bi-gear-wide-connected' />
            Setting
        </button>
    );
}
