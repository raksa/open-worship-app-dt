import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import { useScreenManagerEvents } from './screenEventHelpers';
import { useScreenManagerContext } from './ScreenManager';

export default function ScreenSlide() {
    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['resize'], screenManager, () => {
        screenManager.screenSlideManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { screenSlideManager } = screenManager;
    useAppEffect(() => {
        if (div.current) {
            screenSlideManager.div = div.current;
        }
    });
    return (
        <div id='slide' ref={div}
            style={screenSlideManager.containerStyle}
        />
    );
}
