import { openSetting } from "./SettingPopup";

export default function SettingHeader() {
    return (
        <button className='btn btn-lg btn-outline-success rotating-hover' onClick={() => {
            openSetting();
        }}>
            Setting
            <i className="bi bi-gear-wide-connected" />
        </button>
    );
}
