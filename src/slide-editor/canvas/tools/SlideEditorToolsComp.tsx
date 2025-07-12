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
type TabKeyType = (typeof tabTypeList)[number][0];
export default function SlideEditorToolsComp() {
    const { canvasItems: selectedCanvasItems } =
        useSelectedCanvasItemsAndSetterContext();
    const [tabKey, setTabKey] = useStateSettingString<TabKeyType>(
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
                <TabRenderComp<TabKeyType>
                    tabs={tabTypeList.map(([key, name]) => {
                        return {
                            key,
                            title: name,
                        };
                    })}
                    activeTab={tabKey}
                    setActiveTab={setTabKey}
                />
                <ScalingComp />
            </div>
            <div
                className="tools-body w-100 h-100"
                style={{
                    overflow: 'auto',
                }}
            >
                {tabKey === 'p' ? (
                    <SlideEditorPropertiesComp
                        canvasItems={selectedCanvasItems}
                    />
                ) : null}
                {genTabBody<TabKeyType>(tabKey, ['c', LazyToolCanvasItemsComp])}
            </div>
        </div>
    );
}
