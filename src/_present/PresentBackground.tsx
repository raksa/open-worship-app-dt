import { useRef } from 'react';

import ReactDOMServer from 'react-dom/server';
import { BackgroundSrcType } from './PresentBGManager';
import PresentManager, {
    PresentManagerContext, usePresentManager,
} from './PresentManager';
import PresentBackgroundColor from './PresentBackgroundColor';
import PresentBackgroundImage from './PresentBackgroundImage';
import PresentBackgroundVideo from './PresentBackgroundVideo';
import { usePMEvents } from './presentEventHelpers';
import { AppColorType } from '../others/color/colorHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function PresentBackground() {
    const presentManager = usePresentManager();
    usePMEvents(['resize'], presentManager, () => {
        presentManager.presentBGManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { presentBGManager } = presentManager;
    useAppEffect(() => {
        if (div.current) {
            presentBGManager.div = div.current;
        }
    });
    return (
        <div id='background' ref={div}
            style={presentBGManager.containerStyle} />
    );
}

export function genHtmlBG(
    bgSrc: BackgroundSrcType, presentManager: PresentManager,
) {
    const str = ReactDOMServer.renderToStaticMarkup(
        <PresentManagerContext.Provider value={presentManager}>
            <RenderBG bgSrc={bgSrc} />
        </PresentManagerContext.Provider>
    );
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.firstChild as HTMLDivElement;
}

export function RenderBG({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    const presentManager = usePresentManager();
    const { presentBGManager } = presentManager;
    return (
        <div style={{
            ...presentBGManager.containerStyle,
        }}>
            <RenderPresentBackground bgSrc={bgSrc} />
        </div>
    );
}

function RenderPresentBackground({ bgSrc }: Readonly<{
    bgSrc: BackgroundSrcType,
}>) {
    if (bgSrc === null) {
        return null;
    }
    switch (bgSrc.type) {
        case 'image':
            return (
                <PresentBackgroundImage bgSrc={bgSrc} />
            );
        case 'video':
            return (
                <PresentBackgroundVideo bgSrc={bgSrc} />
            );
        case 'color':
            return (
                <PresentBackgroundColor
                    color={bgSrc.src as AppColorType} />
            );
    }
}
