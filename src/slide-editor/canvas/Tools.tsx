import './Tools.scss';

import { useStateSettingString } from '../../helper/settingHelper';
import ToolsBackground from './ToolsBackground';
import ToolsText from './ToolsText';
import TabRender from '../../others/TabRender';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';
import { useEffect, useState } from 'react';
import CanvasItems from './CanvasItems';

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
    const [tabType, setTabType] = useStateSettingString<TabType>('editor-tools-tab', 't');
    const [canvasItem, setCanvasItem] = useState<CanvasItem | null>(
        canvasController.selectedCanvasItem);
    useEffect(() => {
        const regEvents = canvasController.registerEditingEventListener(
            ['select', 'update'], () => {
                setCanvasItem(canvasController.selectedCanvasItem);
            });
        return () => {
            canvasController.unregisterEditingEventListener(regEvents);
        };
    }, [canvasController]);
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
                {canvasItem !== null && <>
                    {tabType === 't' && <ToolsText canvasItem={canvasItem}
                        canvasController={canvasController} />}
                    {tabType === 'b' && <ToolsBackground canvasItem={canvasItem}
                        canvasController={canvasController} />}
                </>}
                {tabType === 'c' && <CanvasItems
                    canvasController={canvasController} />}
            </div>
        </div>
    );
}
