import { useStateSettingNumber } from '../helper/settingHelper';
import Tools from './Tools';
import SlideItemEditorCanvas from './SlideItemEditorCanvas';
import ResizeActor from '../resize-actor/ResizeActor';
import SlideItem from '../slide-list/SlideItem';
import CanvasController from './CanvasController';
import { useEffect, useState } from 'react';

export default function SlideItemEditor({ slideItem }: {
    slideItem: SlideItem
}) {
    const [canvasController, setCanvasController] = useState<CanvasController>(
        new CanvasController(slideItem));
    useEffect(() => {
        const newCC = new CanvasController(slideItem);
        setCanvasController(newCC);
        return () => {
            newCC.destroy();
        };
    }, [slideItem]);
    const resizeSettingName = 'editor-window-size';
    const flexSizeDefault = {
        'editor-v1': '3',
        'editor-v2': '1',
    };
    const [scale, setScale] = useStateSettingNumber('editor-scale', 1);
    const maxScale = 3;
    const minScale = 0.2;
    const scaleStep = 0.1;
    const applyScale = (isUp: boolean) => {
        let newScale = scale + (isUp ? -1 : 1) * scaleStep;
        if (newScale < minScale) {
            newScale = minScale;
        }
        if (newScale > maxScale) {
            newScale = maxScale;
        }
        setScale(newScale);
    };
    return (
        <div className='slide-item-editor flex v w-100 h-100'
            onWheel={(e) => {
                if (e.ctrlKey) {
                    applyScale(e.deltaY > 0);
                }
            }}>
            <ResizeActor settingName={resizeSettingName}
                flexSizeDefault={flexSizeDefault}
                resizeKinds={['v']}
                sizeKeys={[
                    ['editor-v1', 'flex-item'],
                    ['editor-v2', 'flex-item']]}>
                <div className='editor-container w-100 h-100'>
                    <div className='overflow-hidden' style={{
                        width: `${canvasController.canvas.width * scale + 20}px`,
                        height: `${canvasController.canvas.height * scale + 20}px`,
                    }}>
                        <div className='w-100 h-100' style={{
                            transform: `scale(${scale.toFixed(1)}) translate(50%, 50%)`,
                        }}>
                            {canvasController &&
                                <SlideItemEditorCanvas scale={scale}
                                    canvasController={canvasController} />
                            }
                        </div>
                    </div>
                </div>
                {canvasController.selectedCanvasItem !== null && <Tools
                    canvasItem={canvasController.selectedCanvasItem}
                    scale={scale}
                    applyScale={applyScale}
                    setScale={setScale}
                    minScale={minScale}
                    maxScale={maxScale}
                    scaleStep={scaleStep} />}
            </ResizeActor>
        </div>
    );
}
