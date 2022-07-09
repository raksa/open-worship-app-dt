import BibleList from './bible-list/BibleList';
import SlideList from './slide-list/SlideList';
import MiniPresentScreen from './preview/MiniPresentScreen';
import Background from './background/Background';
import Presenting from './slide-presenting/Presenting';
import { getWindowMode } from './App';
import PlaylistList from './playlist/PlaylistList';
import LyricList from './lyric-list/LyricList';
import ResizeActor from './resize-actor/ResizeActor';

export default function AppPresenting() {
    const resizeSettingName = `${getWindowMode()}-window-size`;
    const flexSizeDefault = {
        'h1': '1',
        'h1-v1': '2',
        'h1-v2': '1',
        'h2': '3',
        'h2-v1': '3',
        'h2-v2': '1',
        'h3': '2',
        'h3-v1': '1',
        'h3-v2': '1',
    };
    return (
        <>
            <ResizeActor settingName={resizeSettingName}
                flexSizeDefault={flexSizeDefault}
                resizeKinds={['h', 'h']}
                sizeKeys={[
                    ['h1', 'flex v'], ['h2', 'flex v'],
                    ['h3', 'right d-flex flex-column'],
                ]}>
                <ResizeActor settingName={resizeSettingName}
                    flexSizeDefault={flexSizeDefault}
                    resizeKinds={['v']}
                    sizeKeys={[
                        ['h1-v1', 'flex-item'],
                        ['h1-v2', 'flex-item'],
                    ]}>
                    <SlideList />
                    <PlaylistList />
                </ResizeActor>
                <ResizeActor settingName={resizeSettingName}
                    flexSizeDefault={flexSizeDefault}
                    resizeKinds={['v']}
                    sizeKeys={[
                        ['h2-v1', 'flex-item'],
                        ['h2-v2', 'flex-item'],
                    ]}>
                    <Presenting />
                    <Background />
                </ResizeActor>
                <>
                    <div className='flex-fill flex v h-100'>
                        <ResizeActor settingName={resizeSettingName}
                            flexSizeDefault={flexSizeDefault}
                            resizeKinds={['v']}
                            sizeKeys={[
                                ['h3-v1', 'flex-item'],
                                ['h3-v2', 'flex-item'],
                            ]}>
                            <BibleList />
                            <LyricList />
                        </ResizeActor>
                    </div>
                    <div>
                        <MiniPresentScreen />
                    </div>
                </>
            </ResizeActor>
        </>
    );
}
