import Tools from './canvas/Tools';
import SlideItemEditorCanvas from './canvas/SlideItemEditorCanvas';
import ResizeActor from '../resize-actor/ResizeActor';
import SlideItem from '../slide-list/SlideItem';
import CanvasController from './canvas/CanvasController';
import { useCCScale } from './canvas/canvasHelpers';

export default function SlideItemEditor({ slideItem }: {
    slideItem: SlideItem
}) {
    const canvasController = CanvasController.getInstant(slideItem);
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
                <Tools canvasController={canvasController} />
            </ResizeActor>
        </div>
    );
}
