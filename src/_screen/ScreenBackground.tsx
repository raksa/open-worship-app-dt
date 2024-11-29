import { useRef } from 'react';

import ReactDOMServer from 'react-dom/server';
import ScreenManager, {
    ScreenManagerContext, useScreenManager,
} from './ScreenManager';
import ScreenBackgroundColor from './ScreenBackgroundColor';
import ScreenBackgroundImage from './ScreenBackgroundImage';
import ScreenBackgroundVideo from './ScreenBackgroundVideo';
import { usePMEvents } from './screenEventHelpers';
import { AppColorType } from '../others/color/colorHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { BackgroundSrcType } from './screenHelpers';

export default function ScreenBackground() {
    const screenManager = useScreenManager();
    usePMEvents(['resize'], screenManager, () => {
        screenManager.screenBGManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { screenBGManager } = screenManager;
    useAppEffect(() => {
        if (div.current) {
            screenBGManager.div = div.current;
        }
    });
    return (
        <div id='background' ref={div}
            style={screenBGManager.containerStyle}
        />
    );
}

export function genHtmlBG(
    bgSrc: BackgroundSrcType, screenManager: ScreenManager,
) {
    const str = ReactDOMServer.renderToStaticMarkup(
        <ScreenManagerContext.Provider value={screenManager}>
            <RenderBG bgSrc={bgSrc} />
        </ScreenManagerContext.Provider>
    );
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.firstChild as HTMLDivElement;
}

export function RenderBG({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    const screenManager = useScreenManager();
    const { screenBGManager } = screenManager;
    return (
        <div style={{
            ...screenBGManager.containerStyle,
        }}>
            <RenderScreenBackground bgSrc={bgSrc} />
        </div>
    );
}

function RenderScreenBackground({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    if (bgSrc === null) {
        return null;
    }
    switch (bgSrc.type) {
        case 'image':
            return (
                <ScreenBackgroundImage bgSrc={bgSrc} />
            );
        case 'video':
            return (
                <ScreenBackgroundVideo bgSrc={bgSrc} />
            );
        case 'color':
            return (
                <ScreenBackgroundColor
                    color={bgSrc.src as AppColorType} />
            );
    }
}
