import './CustomStyle.scss';

import TextShadow from './TextShadow';
import {
    useStateSettingBoolean,
    useStateSettingString,
} from '../helper/settingHelper';
import Appearance from './Appearance';
import { t } from 'i18next';

export default function CustomStyle() {
    const [open, setOpen] = useStateSettingBoolean('open-full-text-present-custom-style');
    return (
        <div className="custom-style card pointer overflow-hidden border-white-round mt-1">
            <div className="card-header" onClick={() => setOpen(!open)}>
                <i className={`bi bi-chevron-${open ? 'down' : 'right'}`} />
                Custom Style
            </div>
            {open && <Body />}
        </div>
    );
}

function Body() {
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
