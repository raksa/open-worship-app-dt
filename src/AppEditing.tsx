import SlideList from './slide-list/SlideList';
import SlideItemEditorPreviewer from './slide-editor/SlideItemEditorPreviewer';
import SlideItemList from './slide-presenting/SlideItemList';
import { getWindowMode } from './App';
import ReSizer from './resizer/ReSizer';

export default function AppEditing() {
    const resizeSettingName = `${getWindowMode()}-window-size`;
    const flexSizeDefault = {
        'h1': '1',
        'h1-v1': '1',
        'h1-v2': '2',
        'h2': '3',
    };
    return (
        <ReSizer settingName={resizeSettingName} flexSizeDefault={flexSizeDefault}
            resizerKinds={['v']}
            sizeKeys={[
                ['h1', 'flex v'],
                ['h2', 'flex v']]}>
            <ReSizer settingName={resizeSettingName} flexSizeDefault={flexSizeDefault}
                resizerKinds={['v']}
                sizeKeys={[
                    ['h1-v1', 'flex-item'],
                    ['h1-v2', 'flex-item']]}>
                <SlideList />
                <SlideItemList />
            </ReSizer>
            <SlideItemEditorPreviewer />
        </ReSizer>
    );
}
