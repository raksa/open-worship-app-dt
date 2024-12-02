import './Tools.scss';

import { Fragment, lazy } from 'react';

import { useStateSettingString } from '../../../helper/settingHelper';
import TabRender, { genTabBody } from '../../../others/TabRender';
import CanvasController from '../CanvasController';
import { CanvasItemContext } from '../CanvasItem';
import {
    useCanvasControllerEvents, useCCScale,
} from '../canvasEventHelpers';
import AppRange from '../../../others/AppRange';

const ToolsBox = lazy(() => {
    return import('./ToolsBox');
});
const ToolsText = lazy(() => {
    return import('./ToolsText');
});
const ToolCanvasItems = lazy(() => {
    return import('./ToolCanvasItems');
});

const MAX_SCALE = 3;
const MIN_SCALE = 0.2;
const SCALE_STEP = 0.1;

export const defaultRangeSize = {
    size: MAX_SCALE,
    min: MIN_SCALE,
    max: MAX_SCALE,
    step: SCALE_STEP,
};

const tabTypeList = [
    ['t', 'Text'],
    ['b', 'Box'],
    ['c', 'Canvas Items'],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function Tools() {
    const canvasController = CanvasController.getInstance();
    const selectedCanvasItems = canvasController.canvas.selectedCanvasItems;
    useCanvasControllerEvents(['select']);
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'editor-tools-tab', 't');
    const scale = useCCScale();
    return (
        <div className='tools d-flex flex-column w-100 h-100'>
            <div className='tools-header d-flex'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
                <div className={'align-self-end flex-fill d-flex '
                    + 'justify-content-end'}>
                    <div className='canvas-board-size-container d-flex ps-1'>
                        <span>{scale.toFixed(1)}x</span>
                        <div style={{ maxWidth: '200px' }}>
                            <AppRange
                                value={scale}
                                title='Canvas Scale'
                                setValue={(scale) => {
                                    canvasController.scale = scale;
                                }}
                                defaultSize={defaultRangeSize} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='tools-body d-flex flex-row flex-fill'>
                {selectedCanvasItems?.map((canvasItem) => {
                    return (
                        <Fragment key={canvasItem.id}>
                            <CanvasItemContext.Provider value={canvasItem}>
                                {genTabBody<TabType>(tabType, ['t', ToolsText])}
                                {genTabBody<TabType>(tabType, ['b', ToolsBox])}
                            </CanvasItemContext.Provider>
                            <hr />
                        </Fragment>
                    );
                })}
                {genTabBody<TabType>(tabType, ['c', ToolCanvasItems])}
            </div>
        </div>
    );
}
