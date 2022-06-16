import BibleList from './bible-list/BibleList';
import SlideList from './slide-list/SlideList';
import Preview from './preview/MiniPresentScreen';
import Background from './background/Background';
import Middle from './slide-presenting/Presenting';
import { getWindowMode } from './App';
import PlaylistList from './playlist/PlaylistList';
import LyricList from './lyric-list/LyricList';
import ReSizer from './resizer/ReSizer';

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
            <ReSizer settingName={resizeSettingName} flexSizeDefault={flexSizeDefault}
                resizerKinds={['h', 'h']}
                sizeKeys={[['h1', 'flex v'], ['h2', 'flex v'], ['h3', 'right d-flex flex-column']]}>
                <ReSizer settingName={resizeSettingName} flexSizeDefault={flexSizeDefault}
                    resizerKinds={['v']}
                    sizeKeys={[['h1-v1', 'flex-item'], ['h1-v2', 'flex-item']]}>
                    <SlideList />
                    <PlaylistList />
                </ReSizer>
                <ReSizer settingName={resizeSettingName} flexSizeDefault={flexSizeDefault}
                    resizerKinds={['v']}
                    sizeKeys={[['h2-v1', 'flex-item'], ['h2-v2', 'flex-item']]}>
                    <Middle />
                    <Background />
                </ReSizer>
                <>
                    <div className='flex-fill flex v h-100'>
                        <ReSizer settingName={resizeSettingName} flexSizeDefault={flexSizeDefault}
                            resizerKinds={['v']}
                            sizeKeys={[['h3-v1', 'flex-item'], ['h3-v2', 'flex-item']]}>
                            <BibleList />
                            <LyricList />
                        </ReSizer>
                    </div>
                    <div>
                        <Preview />
                    </div>
                </>
            </ReSizer>
        </>
    );
}
