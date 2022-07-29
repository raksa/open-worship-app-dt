import './Tools.scss';

import { useStateSettingString } from '../../../helper/settingHelper';
import ToolsBox from './ToolsBox';
import ToolsText from './ToolsText';
import TabRender from '../../../others/TabRender';
import { Fragment } from 'react';
import ToolCanvasItems from './ToolCanvasItems';
import { useCCScale, useCCRefresh } from '../canvasHelpers';
import { canvasController } from '../CanvasController';

// t: text, b: box
type TabType = 't' | 'b' | 'c';
export default function Tools() {
    const selectedCanvasItems = canvasController.canvas?.selectedCanvasItems||[];
    useCCRefresh(['select']);
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
                            {tabType === 't' && <ToolsText
                                canvasItem={canvasItem} />}
                            {tabType === 'b' && <ToolsBox
                                canvasItem={canvasItem} />}
                            <hr />
                        </Fragment>
                    );
                })}
                {tabType === 'c' && <ToolCanvasItems />}
            </div>
        </div>
    );
}
