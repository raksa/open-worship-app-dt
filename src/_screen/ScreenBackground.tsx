import { useRef } from 'react';

import ReactDOMServer from 'react-dom/server';
import ScreenManager, {
    ScreenManagerContext, useScreenManagerContext,
} from './ScreenManager';
import ScreenBackgroundColor from './ScreenBackgroundColor';
import ScreenBackgroundImage from './ScreenBackgroundImage';
import ScreenBackgroundVideo from './ScreenBackgroundVideo';
import { useScreenManagerEvents } from './screenEventHelpers';
import { AppColorType } from '../others/color/colorHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { BackgroundSrcType } from './screenHelpers';

export default function ScreenBackground() {
    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['resize'], screenManager, () => {
        screenManager.screenBackgroundManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { screenBackgroundManager } = screenManager;
    useAppEffect(() => {
        if (div.current) {
            screenBackgroundManager.div = div.current;
        }
    });
    return (
        <div id='background' ref={div}
            style={screenBackgroundManager.containerStyle}
        />
    );
}

export function genHtmlBackground(
    backgroundSrc: BackgroundSrcType, screenManager: ScreenManager,
) {
    const htmlStr = ReactDOMServer.renderToStaticMarkup(
        <ScreenManagerContext value={screenManager}>
            <RenderBackground backgroundSrc={backgroundSrc} />
        </ScreenManagerContext>
    );
    const div = document.createElement('div');
    div.innerHTML = htmlStr;
    const child = div.querySelector('div');
    if (child === null) {
        throw new Error('child is null');
    }
    return child;
}

export function RenderBackground({ backgroundSrc }: Readonly<{
    backgroundSrc: BackgroundSrcType,
}>) {
    const screenManager = useScreenManagerContext();
    const { screenBackgroundManager } = screenManager;
    return (
        <div style={{
            ...screenBackgroundManager.containerStyle,
        }}>
            <RenderScreenBackground backgroundSrc={backgroundSrc} />
        </div>
    );
}

function RenderScreenBackground({ backgroundSrc }: Readonly<{
    backgroundSrc: BackgroundSrcType,
}>) {
    if (backgroundSrc === null) {
        return null;
    }
    switch (backgroundSrc.type) {
        case 'image':
            return (
                <ScreenBackgroundImage backgroundSrc={backgroundSrc} />
            );
        case 'video':
            return (
                <ScreenBackgroundVideo backgroundSrc={backgroundSrc} />
            );
        case 'color':
            return (
                <ScreenBackgroundColor
                    color={backgroundSrc.src as AppColorType} />
            );
    }
}
