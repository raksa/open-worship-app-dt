import './SlideEditorToolsComp.scss';

import { lazy } from 'react';

import { useStateSettingString } from '../../../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../../../others/TabRenderComp';
import {
    defaultRangeSize,
    useCanvasControllerContext,
} from '../CanvasController';
import { useSlideCanvasScale } from '../canvasEventHelpers';
import AppRangeComp from '../../../others/AppRangeComp';
import SlideEditorPropertiesComp from './SlideEditorPropertiesComp';
import { useSelectedCanvasItemsAndSetterContext } from '../CanvasItem';

const LazyToolCanvasItemsComp = lazy(() => {
    return import('./ToolCanvasItemsComp');
});

function ScalingComp() {
    const canvasController = useCanvasControllerContext();
    const scale = useSlideCanvasScale();
    const actualScale = scale * 10;
    return (
        <div className={'align-self-end flex-fill d-flex justify-content-end'}>
            <div className="canvas-board-size-container d-flex ps-1">
                <span>{actualScale.toFixed(1)}x</span>
                <div style={{ maxWidth: '200px' }}>
                    <AppRangeComp
                        value={actualScale}
                        title="Canvas Scale"
                        setValue={(scale) => {
                            canvasController.scale = scale / 10;
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
type TabType = (typeof tabTypeList)[number][0];

export default function SlideEditorToolsComp() {
    const { canvasItems: selectedCanvasItems } =
        useSelectedCanvasItemsAndSetterContext();

    const [tabType, setTabType] = useStateSettingString<TabType>(
        'editor-tools-tab',
        'p',
    );
    return (
        <div
            className={
                'app-tools d-flex flex-column w-100 h-100 overflow-hidden'
            }
        >
            <div className="tools-header d-flex">
                <TabRenderComp<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                />
                <ScalingComp />
            </div>
            <div
                className="tools-body w-100 h-100"
                style={{
                    overflow: 'auto',
                }}
            >
                {tabType === 'p' ? (
                    <SlideEditorPropertiesComp
                        canvasItems={selectedCanvasItems}
                    />
                ) : null}
                {genTabBody<TabType>(tabType, ['c', LazyToolCanvasItemsComp])}
            </div>
        </div>
    );
}
