import './Background.scss';

import Colors from './Colors';
import Images from './Images';
import Videos from './Videos';
import { useStateSettingString } from '../helper/settingHelper';
import TabRender from '../others/TabRender';

// c: color, i: image, v: video
type TabType = 'c' | 'i' | 'v';
export default function Background() {
    const [tabType, setTabType] = useStateSettingString<TabType>('background-tab', 'i');
    return (
        <div className='background w-100 d-flex flex-column'>
            <div className='background-header'>
                <TabRender<TabType> tabs={[
                    ['c', 'Colors'],
                    ['i', 'Images'],
                    ['v', 'Videos'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='background-body w-100 flex-fill'>
                {tabType === 'c' && <Colors />}
                {tabType === 'i' && <Images />}
                {tabType === 'v' && <Videos />}
            </div>
        </div>
    );
}
