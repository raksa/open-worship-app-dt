import { clearWidgetSizeSetting } from '../resize-actor/flexSizeHelpers';
import SettingGeneralLanguage from './SettingGeneralLanguage';
import SettingGeneralDisplay from './SettingGeneralDisplay';

export default function SettingGeneral() {
    return (
        <div>
            <SettingGeneralLanguage />
            <hr />
            <SettingGeneralDisplay />
            <hr />
            <button className='btn btn-info' onClick={() => {
                clearWidgetSizeSetting();
                location.reload();
            }}>Reset Widgets Size</button>
        </div>
    );
}
