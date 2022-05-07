import './Background.scss';

import Colors from './Colors';
import Images from './Images';
import Videos from './Videos';
import { useStateSettingString } from '../helper/settingHelper';
import { useTranslation } from 'react-i18next';

export default function Background() {
    const { t } = useTranslation();
    // c: color, i: image, v: video
    const [tabType, setTabType] = useStateSettingString('background-tab', 'i');
    return (
        <div className="background w-100 d-flex flex-column">
            <div className='background-header'>
                <ul className="nav nav-tabs">
                    {[['c', 'Colors'], ['i', 'Images'], ['v', 'Videos']].map(([key, title], i) => {
                        return (<li key={i} className="nav-item">
                            <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                                onClick={() => setTabType(key)}>
                                {t(title)}
                            </button>
                        </li>);
                    })}
                </ul>
            </div>
            <div className="background-body w-100 flex-fill">
                {tabType === 'c' && <Colors />}
                {tabType === 'i' && <Images />}
                {tabType === 'v' && <Videos />}
            </div>
        </div>
    );
}
