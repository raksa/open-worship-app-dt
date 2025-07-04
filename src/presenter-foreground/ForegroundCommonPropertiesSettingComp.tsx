import FontFamilyControlComp from '../others/FontFamilyControlComp';
import { getSetting, useStateSettingString } from '../helper/settingHelpers';

const FONT_FAMILY_SETTING_NAME = 'foreground-common-font-family';
const FONT_WEIGHT_SETTING_NAME = 'foreground-common-font-weight';

export function getForegroundCommonProperties() {
    return {
        fontFamily: getSetting(FONT_FAMILY_SETTING_NAME) ?? '',
        fontWeight: getSetting(FONT_WEIGHT_SETTING_NAME) ?? '',
    };
}

export default function ForegroundCommonPropertiesSettingComp() {
    const [localFontFamily, setLocalFontFamily] = useStateSettingString(
        FONT_FAMILY_SETTING_NAME,
    );
    const setLocalFontFamily1 = (fontFamily: string) => {
        setLocalFontFamily(fontFamily);
    };
    const [localFontWeight, setLocalFontWeight] = useStateSettingString(
        FONT_WEIGHT_SETTING_NAME,
    );
    const setLocalFontWeight1 = (fontWeight: string) => {
        setLocalFontWeight(fontWeight);
    };
    return (
        <div className="d-flex">
            <strong>Font:</strong>
            <FontFamilyControlComp
                fontFamily={localFontFamily}
                setFontFamily={setLocalFontFamily1}
                fontWeight={localFontWeight}
                setFontWeight={setLocalFontWeight1}
                isShowingLabel={false}
            />
        </div>
    );
}
