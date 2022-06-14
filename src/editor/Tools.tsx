import './Tools.scss';

import { useState } from 'react';
import { useSlideBoxEditing } from '../event/SlideListEventListener';
import { HTML2ReactChild } from '../helper/slideHelper';
import { useStateSettingString } from '../helper/settingHelper';
import { useTranslation } from 'react-i18next';
import ToolsBackground from './ToolsBackground';
import ToolsText from './ToolsText';

export default function Tools({
    scale, applyScale, setScale, minScale, maxScale, scaleStep,
}: {
    scale: number, applyScale: (isUp: boolean) => void,
    setScale: (newScale: number) => void,
    minScale: number, maxScale: number, scaleStep: number
}) {
    const { t } = useTranslation();
    const [data, setData] = useState<HTML2ReactChild | null>(null);
    // t: text, b: box
    const [tabType, setTabType] = useStateSettingString('editor-tools-tab', 't');
    useSlideBoxEditing((newData) => {
        setData(newData);
    });
    return (
        <div className="tools d-flex flex-column w-100 h-100">
            <div className="tools-header d-flex">
                <ul className="nav nav-tabs ">
                    {[['t', 'Text'], ['b', 'Box']].map(([key, title], i) => {
                        return (<li key={i} className="nav-item">
                            <button className={`btn btn-link nav-link ${tabType === key ? 'active' : ''}`}
                                onClick={() => setTabType(key)}>
                                {t(title)}
                            </button>
                        </li>);
                    })}
                </ul>
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
