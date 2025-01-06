import './SlideItemEditorToolsComp.scss';

import { lazy } from 'react';

import { useStateSettingString } from '../../../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../../../others/TabRenderComp';
import {
    defaultRangeSize, useCanvasControllerContext,
} from '../CanvasController';
import {
    useSlideItemCanvasScale,
} from '../canvasEventHelpers';
import AppRangeComp from '../../../others/AppRangeComp';
import SlideItemEditorPropertiesComp from './SlideItemEditorPropertiesComp';
import { useSelectedCanvasItemsAndSetterContext } from '../CanvasItem';

const LazyToolCanvasItems = lazy(() => {
    return import('./ToolCanvasItemsComp');
});

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
                    <AppRangeComp
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
                <TabRenderComp<TabType>
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
