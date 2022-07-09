import { useBibleItemSelecting, useLyricSelecting } from '../event/PreviewingEventListener';
import {
    getSetting, useStateSettingString,
} from '../helper/settingHelper';
import TabRender from '../others/TabRender';
import BiblePreviewer from './BiblePreviewer';
import LyricPreviewer from './LyricPreviewer';

export const previewer: { show: Function } = {
    show: () => false,
};
const FT_TAB_SETTING_NAME = 'full-text-previewer';
export function getIsPreviewingBible() {
    return getSetting(FT_TAB_SETTING_NAME) === 'b';
}
export function getIsPreviewingLyric() {
    return getSetting(FT_TAB_SETTING_NAME) === 'l';
}
export type TabType = 'b' | 'l';
// b: bible, l: lyric
export default function FullTextPreviewer() {
    const [tabType, setTabType] = useStateSettingString<TabType>(FT_TAB_SETTING_NAME, 'b');
    useBibleItemSelecting((item) => {
        if (item !== null) {
            setTabType('b');
        }
    });
    useLyricSelecting((item) => {
        if (item !== null) {
            setTabType('l');
        }
    });
    return (
        <div className='previewer overflow-hidden border-white-round h-100 d-flex flex-column p-1'>
            <div className="previewer-header d-flex">
                <TabRender<'b' | 'l'> tabs={[
                    ['b', 'Bible'],
                    ['l', 'Lyric'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='previewer-header p-2 flex-fill overflow-hidden'>
                {tabType === 'b' && <BiblePreviewer />}
                {tabType === 'l' && <LyricPreviewer />}
            </div>
        </div>
    );
}
