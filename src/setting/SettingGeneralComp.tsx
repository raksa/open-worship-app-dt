import { clearWidgetSizeSetting } from '../resize-actor/flexSizeHelpers';
import SettingGeneralLanguageComp from './SettingGeneralLanguageComp';
import appProvider from '../server/appProvider';

export default function SettingGeneralComp() {
    return (
        <div>
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
