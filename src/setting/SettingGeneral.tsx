import { clearWidgetSizeSetting } from '../resize-actor/flexSizeHelpers';
import SettingGeneralLanguage from './SettingGeneralLanguage';
import appProvider from '../server/appProvider';

export default function SettingGeneral() {
    return (
        <div>
            <SettingGeneralLanguage />
            <hr />
            <button className='btn btn-info'
                onClick={() => {
                    clearWidgetSizeSetting();
                    appProvider.reload();
                }}>Reset Widgets Size</button>
        </div>
    );
}
