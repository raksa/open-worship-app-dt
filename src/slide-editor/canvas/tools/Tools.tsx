import './Tools.scss';

import React, { Fragment } from 'react';
import { useStateSettingString } from '../../../helper/settingHelper';
import TabRender, { genTabBody } from '../../../others/TabRender';
import { useCCScale, useCCEvents } from '../canvasHelpers';
import CanvasController from '../CanvasController';
import { CanvasItemContext } from '../CanvasItem';

const ToolsBox = React.lazy(() => import('./ToolsBox'));
const ToolsText = React.lazy(() => import('./ToolsText'));
const ToolCanvasItems = React.lazy(() => import('./ToolCanvasItems'));

// t: text, b: box
type TabType = 't' | 'b' | 'c';
export default function Tools() {
    const canvasController = CanvasController.getInstance();
    const selectedCanvasItems = canvasController.canvas.selectedCanvasItems;
    useCCEvents(['select']);
    const [tabType, setTabType] = useStateSettingString<TabType>('editor-tools-tab', 't');
    const scale = useCCScale();
    return (
        <div className='tools d-flex flex-column w-100 h-100'>
            <div className='tools-header d-flex'>
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
                        <input type='range' className='form-range'
                            onChange={(e) => {
                                canvasController.scale = +e.target.value;
                            }}
                            min={canvasController.MIN_SCALE}
                            max={canvasController.MAX_SCALE}
                            step={canvasController.SCALE_STEP}
                            value={scale}
                            onWheel={(e) => {
                                canvasController.applyScale(e.deltaY > 0);
                            }} />
                    </div>
                </div>
            </div>
            <div className='tools-body d-flex flex-row flex-fill'>
                {selectedCanvasItems?.map((canvasItem, i) => {
                    return (
                        <Fragment key={i}>
                            <CanvasItemContext.Provider value={canvasItem}>
                                {genTabBody(tabType, ['t', ToolsText])}
                                {genTabBody(tabType, ['b', ToolsBox])}
                            </CanvasItemContext.Provider>
                            <hr />
                        </Fragment>
                    );
                })}
                {genTabBody(tabType, ['c', ToolCanvasItems])}
            </div>
        </div>
    );
}
