import {
    useBiblePresenting,
    useLyricPresenting,
} from '../event/PreviewingEventListener';
import { useStateSettingString } from '../helper/settingHelper';
import TabRender from '../others/TabRender';
import BiblePreviewer from './BiblePreviewer';
import LyricPreviewer from './LyricPreviewer';

export const previewer: { show: Function } = {
    show: () => false,
};
export const FULL_TEXT_TAB_KEY = 'full-text-present-tab';
// b: bible, l: lyric
export type TabType = 'b' | 'l';
export default function FullTextPreviewer() {
    const [tabType, setTabType] = useStateSettingString<TabType>(FULL_TEXT_TAB_KEY, 'b');
    useBiblePresenting(() => setTabType('b'));
    useLyricPresenting(() => setTabType('l'));
    return (
        <div className='previewer overflow-hidden border-white-round h-100 d-flex flex-column p-1'>
            <div className="previewer-header d-flex">
                <TabRender<TabType> tabs={[
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
