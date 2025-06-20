import { clearWidgetSizeSetting } from '../resize-actor/flexSizeHelpers';
import SettingGeneralLanguageComp from './SettingGeneralLanguageComp';
import appProvider from '../server/appProvider';
import SettingGeneralPath from './path-setting/SettingGeneralPathComp';

export default function SettingGeneralComp() {
    return (
        <div>
            <SettingGeneralPath />
            <hr />
            <SettingGeneralLanguageComp />
            <hr />
            <button
                className="btn btn-info"
                onClick={() => {
                    clearWidgetSizeSetting();
                    appProvider.reload();
                }}
            >
                Reset Widgets Size
            </button>
        </div>
    );
}
