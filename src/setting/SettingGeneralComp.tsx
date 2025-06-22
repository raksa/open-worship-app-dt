import { clearWidgetSizeSetting } from '../resize-actor/flexSizeHelpers';
import SettingGeneralLanguageComp from './SettingGeneralLanguageComp';
import appProvider from '../server/appProvider';
import SettingGeneralPath from './directory-setting/SettingGeneralPathComp';

export default function SettingGeneralComp() {
    return (
        <div
            className="w-100 h-100 d-flex justify-content-center p-1"
            style={{
                overflowY: 'auto',
            }}
        >
            <div className="m-1" style={{ minWidth: '600px' }}>
                <SettingGeneralPath />
            </div>
            <div className="m-1">
                {appProvider.systemUtils.isDev ? (
                    <>
                        <SettingGeneralLanguageComp />
                        <hr />
                    </>
                ) : null}
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
        </div>
    );
}
