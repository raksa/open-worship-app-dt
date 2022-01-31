import BibleList from './bible-list/BibleList';
import FlexResizer, { getPresentingFlexSize } from './FlexResizer';
import SlideList from './slide-list/SlideList';
import Preview from './preview/MiniPresentScreen';
import Background from './background/Background';
import Middle from './slide-presenting/Presenting';
import { getWindowMode } from './App';
import Playlist from './playlist/Playlist';
import LyricList from './lyric-list/LyricList';

export default function AppPresenting() {
    const resizeSettingName = `${getWindowMode()}-window-size`;
    const flexSize = getPresentingFlexSize(resizeSettingName, {
        'h1': '1',
        'h1-v1': '2',
        'h1-v2': '1',
        'h2': '3',
        'h2-v1': '3',
        'h2-v2': '1',
        'h3': '2',
        'h3-v1': '1',
        'h3-v2': '1',
    });
    return (
        <>
            <div data-fs='h1' className="flex v" style={{ flex: flexSize['h1'] || 1 }}>
                <div data-fs='h1-v1' className="flex-item" style={{ flex: flexSize['h1-v1'] || 1 }}>
                    <SlideList />
                </div>
                <FlexResizer settingName={resizeSettingName} type={'v'} />
                <div data-fs='h1-v2' className="flex-item" style={{ flex: flexSize['h1-v2'] || 1 }}>
                    <Playlist />
                </div>
            </div>
            <FlexResizer settingName={resizeSettingName} type={'h'} />
            <div data-fs='h2' className="flex v" style={{ flex: flexSize['h2'] || 1 }}>
                <div data-fs='h2-v1' className="flex-item" style={{ flex: flexSize['h2-v1'] || 1 }}>
                    <Middle />
                </div>
                <FlexResizer settingName={resizeSettingName} type={'v'} />
                <div data-fs='h2-v2' className="flex-item" style={{ flex: flexSize['h2-v2'] || 1 }}>
                    <Background />
                </div>
            </div>
            <FlexResizer settingName={resizeSettingName} type={'h'} />
            <div data-fs='h3' className="right d-flex flex-column" style={{ flex: flexSize['h3'] || 1 }}>
                <div className='flex-fill flex v h-100'>
                    <div data-fs='h3-v1' className="flex-item" style={{ flex: flexSize['h3-v1'] || 1 }}>
                        <BibleList />
                    </div>
                    <FlexResizer settingName={resizeSettingName} type={'v'} />
                    <div data-fs='h3-v2' className="flex-item" style={{ flex: flexSize['h3-v2'] || 1 }}>
                        <LyricList />
                    </div>
                </div>
                <div>
                    <Preview />
                </div>
            </div>
        </>
    );
}
