import { getSetting, useStateSettingBoolean } from '../helper/settingHelpers';
import {
    QuickOrBackButtonComp,
    SettingButtonComp,
} from '../others/commonButtons';
import appProvider from '../server/appProvider';

const CLOSE_ON_ADD_BIBLE_ITEM = 'close-on-add-bible-item';

export function getIsKeepingPopup() {
    if (appProvider.isPageReader) {
        return true;
    }
    return getSetting(CLOSE_ON_ADD_BIBLE_ITEM) === 'true';
}

export default function RenderExtraButtonsRight({
    setIsSearchOnline,
    isSearchOnline,
}: Readonly<{
    setIsSearchOnline: (_: boolean) => void;
    isSearchOnline: boolean;
}>) {
    const [isKeepingPopup, setIsKeepingPopup] = useStateSettingBoolean(
        CLOSE_ON_ADD_BIBLE_ITEM,
        false,
    );
    return (
        <div className="d-flex">
            {appProvider.isPagePresenter ? (
                <div className="btn-group form-check form-switch">
                    <input
                        className="form-check-input pointer"
                        title="Keep window open when add bible item"
                        type="checkbox"
                        role="switch"
                        checked={isKeepingPopup}
                        onChange={(event) => {
                            setIsKeepingPopup(event.target.checked);
                        }}
                    />
                </div>
            ) : null}
            <button
                className={
                    'btn btn-sm btn' +
                    `-${isSearchOnline ? '' : 'outline-'}info`
                }
                title="Search bible online"
                onClick={() => {
                    setIsSearchOnline(!isSearchOnline);
                }}
            >
                <i className="bi bi-search" />
            </button>
            {!appProvider.isPageReader ? null : (
                <>
                    <QuickOrBackButtonComp title="Quit Reader" />
                    <SettingButtonComp />
                </>
            )}
        </div>
    );
}
