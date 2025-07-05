import { dirSourceSettingNames } from '../helper/constants';
import { getSetting, useStateSettingBoolean } from '../helper/settingHelpers';

const SETTING_NAME = dirSourceSettingNames.BACKGROUND_VIDEO + '-fading-at-end';

export function getIsFadingAtEndSetting() {
    return getSetting(SETTING_NAME) !== 'false';
}

export default function VideoHeaderSettingComp() {
    const [isFadingAtEnd, setIsFadingAtEnd] = useStateSettingBoolean(
        SETTING_NAME,
        true,
    );
    return (
        <div className="app-inner-shadow">
            <div className="input-group-text">
                `Fading the End:{' '}
                <input
                    className="form-check-input mt-0"
                    type="checkbox"
                    checked={isFadingAtEnd}
                    onChange={(event) => {
                        const checked = event.target.checked;
                        setIsFadingAtEnd(checked);
                    }}
                />
            </div>
        </div>
    );
}
