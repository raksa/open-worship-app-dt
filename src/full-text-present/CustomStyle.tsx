import './CustomStyle.scss';

import TextShadow from './TextShadow';
import { useStateSettingString } from '../helper/settingHelper';
import Appearance from './Appearance';
import { useTranslation } from 'react-i18next';

export default function CustomStyle() {
    return (
        <div className="custom-style card pointer border-white-round mt-1">
            <div className="card-header">
                Custom Style
            </div>
            <Body />
        </div>
    );
}

function Body() {
    const { t } = useTranslation();
    // a: appearance, s: shadow
    const [tabType, setTabType] = useStateSettingString('tull-text-present-custom-style-tab', 'a');
    return (
        <div className='card-body'>
            <div className="d-flex">
                <ul className="nav nav-tabs flex-fill">
                    {[['a', 'Appearance'], ['s', 'Shadow']].map(([key, title], i) => {
                        return (<li key={i} className="nav-item">
                            <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                                onClick={() => setTabType(key)}>
                                {t(title)}
                            </button>
                        </li>);
                    })}
                </ul>
            </div>
            <div className='custom-style-body p-2'>
                {tabType === 'a' && <Appearance />}
                {tabType === 's' && <TextShadow />}
            </div>
        </div>
    );
}
