import { t } from 'i18next';
import {
    useBiblePresenting,
    useLyricPresenting,
} from '../event/FullTextPresentEventListener';
import { useStateSettingString } from '../helper/settingHelper';
import BiblePreviewer from './BiblePreviewer';
import LyricPreviewer from './LyricPreviewer';

export const previewer = {
    show: () => { },
};
export default function Previewer() {
    // b: bible, l: lyric
    const [tabType, setTabType] = useStateSettingString('full-text-present-tab', 'b');
    useBiblePresenting(() => setTabType('b'));
    useLyricPresenting(() => setTabType('l'));
    return (
        <div className='previewer overflow-hidden border-white-round h-100 d-flex flex-column p-1'>
            <div className="previewer-header d-flex">
                <ul className="nav nav-tabs flex-fill">
                    {[['b', 'Bible'], ['l', 'Lyric']].map(([key, title], i) => {
                        return (<li key={i} className="nav-item">
                            <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                                onClick={() => setTabType(key)}>
                                {t(title)}
                            </button>
                        </li>);
                    })}
                </ul>
            </div>
            <div className='previewer-header p-2 flex-fill overflow-hidden'>
                {tabType === 'b' && <BiblePreviewer />}
                {tabType === 'l' && <LyricPreviewer />}
            </div>
        </div>
    );
}
