import './Background.scss';

import Colors from './Colors';
import Images from './Images';
import Videos from './Videos';
import { useStateSettingString } from '../helper/settingHelper';

export default function Background() {
    // c: color, i: image, v: video
    const [tabType, setTabType] = useStateSettingString('background-tab', 'i');
    return (
        <div className="background w-100 d-flex flex-column">
            <div className='background-header'>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'c' ? 'active' : ''}`}
                            onClick={() => setTabType('c')}>
                            Colors
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'i' ? 'active' : ''}`}
                            onClick={() => setTabType('i')}>
                            Images
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'v' ? 'active' : ''}`}
                            onClick={() => setTabType('v')}>
                            Videos
                        </button>
                    </li>
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
