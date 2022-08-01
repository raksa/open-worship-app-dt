import Tools from './canvas/tools/Tools';
import SlideItemEditorCanvas from './canvas/SlideItemEditorCanvas';
import ResizeActor from '../resize-actor/ResizeActor';
import SlideItem from '../slide-list/SlideItem';
import CanvasController from './canvas/CanvasController';

export default function SlideItemEditor({ slideItem }: {
    slideItem: SlideItem
}) {
    if (slideItem.isError) {
        return (
            <div className='alert alert-danger'>Error</div>
        );
    }
    const resizeSettingName = 'editor-window-size';
    const flexSizeDefault = {
        'editor-v1': '3',
        'editor-v2': '1',
    };
    return (
        <div className='slide-item-editor flex v w-100 h-100'
            onWheel={(e) => {
                if (e.ctrlKey) {
                    CanvasController.getInstance()
                        .applyScale(e.deltaY > 0);
                }
            }}>
            <ResizeActor settingName={resizeSettingName}
                flexSizeDefault={flexSizeDefault}
                resizeKinds={['v']}
                sizeKeys={[
                    ['editor-v1', 'flex-item'],
                    ['editor-v2', 'flex-item']]}>
                <SlideItemEditorCanvas />
                <Tools />
            </ResizeActor>
        </div>
    );
}
