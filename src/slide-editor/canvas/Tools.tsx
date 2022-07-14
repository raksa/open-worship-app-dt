import './Tools.scss';

import { useStateSettingString } from '../../helper/settingHelper';
import ToolsBackground from './ToolsBackground';
import ToolsText from './ToolsText';
import TabRender from '../../others/TabRender';
import CanvasController from './CanvasController';
import { Fragment } from 'react';
import CanvasItems from './CanvasItems';
import { useCCRefresh } from './canvasHelpers';

// t: text, b: box
type TabType = 't' | 'b' | 'c';
export default function Tools({
    canvasController,
    scale, applyScale, setScale,
    minScale, maxScale, scaleStep,
}: {
    canvasController: CanvasController,
    scale: number, applyScale: (isUp: boolean) => void,
    setScale: (newScale: number) => void,
    minScale: number, maxScale: number, scaleStep: number
}) {
    useCCRefresh(canvasController, ['select']);
    const [tabType, setTabType] = useStateSettingString<TabType>('editor-tools-tab', 't');
    return (
        <div className="tools d-flex flex-column w-100 h-100">
            <div className="tools-header d-flex">
                <TabRender<TabType> tabs={[
                    ['t', 'Text'],
                    ['b', 'Box'],
                    ['c', 'Items'],
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
                {canvasController.selectedCanvasItems.map((canvasItem, i) => {
                    return (
                        <Fragment key={i}>
                            {tabType === 't' && <ToolsText canvasItem={canvasItem}
                                canvasController={canvasController} />}
                            {tabType === 'b' && <ToolsBackground canvasItem={canvasItem}
                                canvasController={canvasController} />}
                            <hr />
                        </Fragment>
                    );
                })}
                {tabType === 'c' && <CanvasItems
                    canvasController={canvasController} />}
            </div>
        </div>
    );
}
