import './Tools.scss';

import { useState } from 'react';
import { useSlideBoxEditing } from '../event/SlideListEventListener';
import { useStateSettingString } from '../helper/settingHelper';
import ToolsBackground from './ToolsBackground';
import ToolsText from './ToolsText';
import HTML2ReactChild from './HTML2ReactChild';
import TabRender from '../others/TabRender';

// t: text, b: box
type TabType = 't' | 'b';
export default function Tools({
    scale, applyScale, setScale, minScale, maxScale, scaleStep,
}: {
    scale: number, applyScale: (isUp: boolean) => void,
    setScale: (newScale: number) => void,
    minScale: number, maxScale: number, scaleStep: number
}) {
    const [data, setData] = useState<HTML2ReactChild | null>(null);
    const [tabType, setTabType] = useStateSettingString<TabType>('editor-tools-tab', 't');
    useSlideBoxEditing((newData) => {
        setData(newData);
    });
    return (
        <div className="tools d-flex flex-column w-100 h-100">
            <div className="tools-header d-flex">
                <TabRender<TabType> tabs={[
                    ['t', 'Text'],
                    ['b', 'Box'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
                <div className='align-self-end flex-fill d-flex justify-content-end'>
                    <span>{scale.toFixed(1)}x</span>
                    <div style={{ maxWidth: '200px' }}>
                        <input type="range" className='form-range'
                            onChange={(e) => setScale(+e.target.value)}
                            min={minScale} max={maxScale} step={scaleStep}
                            value={scale} onWheel={(e) => applyScale(e.deltaY > 0)} />
                    </div>
                </div>
            </div>
            <div className='tools-body d-flex flex-row flex-fill'>
                {data && <>
                    {tabType === 't' && <ToolsText data={data} />}
                    {tabType === 'b' && <ToolsBackground data={data} />}
                </>}
            </div>
        </div>
    );
}
