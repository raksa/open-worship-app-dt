import { useBiblePresenting } from '../event/BibleListEventListener';
import { useStateSettingString } from '../helper/helpers';
import BiblePreviewer from './BiblePreviewer';
import LyricPreviewer from './LyricPreviewer';

export const previewer = {
    show: () => { },
};
export default function Previewer() {
    // b: bible, l: lyric
    const [tabType, setTabType] = useStateSettingString('full-text-present-tab', 'b');
    useBiblePresenting(() => setTabType('b'));
    return (
        <div className='previewer overflow-hidden border-white-round h-100 d-flex flex-column p-1'>
            <div className="previewer-header d-flex">
                <ul className="nav nav-tabs flex-fill">
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'b' ?
                            'active' : 'highlight-border-bottom'}`}
                            onClick={() => setTabType('b')}>
                            Bible
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'l' ?
                            'active' : 'highlight-border-bottom'}`}
                            onClick={() => setTabType('l')}>
                            Lyric
                        </button>
                    </li>
                </ul>
            </div>
            <div className='previewer-header p-2 flex-fill overflow-hidden'>
                {tabType === 'b' && <BiblePreviewer />}
                {tabType === 'l' && <LyricPreviewer />}
            </div>
        </div>
    );
}
