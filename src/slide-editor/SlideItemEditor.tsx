import Tools from './canvas/tools/Tools';
import SlideItemEditorCanvas from './canvas/SlideItemEditorCanvas';
import ResizeActor from '../resize-actor/ResizeActor';
import SlideItem from '../slide-list/SlideItem';
import CanvasController from './canvas/CanvasController';
import { useCCScale } from './canvas/canvasHelpers';
import { useEffect, useState } from 'react';

export default function SlideItemEditor({ slideItem }: {
    slideItem: SlideItem
}) {
    const [canvasController, setCanvasController] = useState(
        CanvasController.getInstant(slideItem));
    useEffect(() => {
        const newCanvasController = CanvasController.getInstant(slideItem);
        newCanvasController.canvas
            .initChildren(newCanvasController).then(() => {
                setCanvasController(newCanvasController);
            });
    }, [slideItem]);
    const scale = useCCScale(canvasController);

    const resizeSettingName = 'editor-window-size';
    const flexSizeDefault = {
        'editor-v1': '3',
        'editor-v2': '1',
    };

    return (
        <div className='slide-item-editor flex v w-100 h-100'
            onWheel={(e) => {
                if (e.ctrlKey) {
                    canvasController.applyScale(e.deltaY > 0);
                }
            }}>
            <ResizeActor settingName={resizeSettingName}
                flexSizeDefault={flexSizeDefault}
                resizeKinds={['v']}
                sizeKeys={[
                    ['editor-v1', 'flex-item'],
                    ['editor-v2', 'flex-item']]}>
                <SlideItemEditorCanvas scale={scale}
                    canvasController={canvasController} />
                <Tools canvasController={canvasController} />
            </ResizeActor>
        </div>
    );
}
