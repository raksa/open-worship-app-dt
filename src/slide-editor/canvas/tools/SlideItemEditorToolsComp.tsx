import './SlideItemEditorToolsComp.scss';

import { lazy } from 'react';

import { useStateSettingString } from '../../../helper/settingHelpers';
import TabRender, { genTabBody } from '../../../others/TabRender';
import { useCanvasControllerContext } from '../CanvasController';
import {
    useSlideItemCanvasScale,
} from '../canvasEventHelpers';
import AppRange from '../../../others/AppRange';
import SlideItemEditorPropertiesComp from './SlideItemEditorPropertiesComp';
import { useSelectedCanvasItemsAndSetterContext } from '../CanvasItem';

const LazyToolCanvasItems = lazy(() => {
    return import('./ToolCanvasItemsComp');
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

function ScalingComp() {
    const canvasController = useCanvasControllerContext();
    const scale = useSlideItemCanvasScale();
    return (
        <div className={
            'align-self-end flex-fill d-flex justify-content-end'
        }>
            <div className='canvas-board-size-container d-flex ps-1'>
                <span>{scale.toFixed(1)}x</span>
                <div style={{ maxWidth: '200px' }}>
                    <AppRange
                        value={scale}
                        title='Canvas Scale'
                        setValue={(scale) => {
                            canvasController.scale = scale;
                        }}
                        defaultSize={defaultRangeSize}
                    />
                </div>
            </div>
        </div>
    );
}

const tabTypeList = [
    ['p', 'Properties'],
    ['c', 'Canvas Items'],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function SlideItemEditorToolsComp() {
    const {
        canvasItems: selectedCanvasItems,
    } = useSelectedCanvasItemsAndSetterContext();

    const [tabType, setTabType] = useStateSettingString<TabType>(
        'editor-tools-tab', 'p',
    );
    return (
        <div className={
            'app-tools d-flex flex-column w-100 h-100 overflow-hidden'
        }>
            <div className='tools-header d-flex'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                />
                <ScalingComp />
            </div>
            <div className='tools-body w-100 h-100' style={{
                overflow: 'auto',
            }}>
                {tabType === 'p' ? (
                    <SlideItemEditorPropertiesComp
                        canvasItems={selectedCanvasItems}
                    />
                ) : null}
                {genTabBody<TabType>(tabType, ['c', LazyToolCanvasItems])}
            </div>
        </div>
    );
}
