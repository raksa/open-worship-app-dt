import SlideList from './slide-list/SlideList';
import SlideItemEditorSlideItemEditorGround from './slide-editor/SlideItemEditorGround';
import { getWindowMode } from './App';
import ResizeActor from './resize-actor/ResizeActor';
import SlidePreviewer from './slide-presenting/SlidePreviewer';

export default function AppEditing() {
    const resizeSettingName = `${getWindowMode()}-window-size`;
    const flexSizeDefault = {
        'h1': '1',
        'h1-v1': '1',
        'h1-v2': '2',
        'h2': '3',
    };
    return (
        <ResizeActor settingName={resizeSettingName}
            flexSizeDefault={flexSizeDefault}
            resizeKinds={['h']}
            sizeKeys={[
                ['h1', 'flex v'],
                ['h2', 'flex v']]}>
            <ResizeActor settingName={resizeSettingName}
                flexSizeDefault={flexSizeDefault}
                resizeKinds={['v']}
                sizeKeys={[
                    ['h1-v1', 'flex-item'],
                    ['h1-v2', 'flex-item']]}>
                <SlideList />
                <SlidePreviewer />
            </ResizeActor>
            <SlideItemEditorSlideItemEditorGround />
        </ResizeActor>
    );
}
