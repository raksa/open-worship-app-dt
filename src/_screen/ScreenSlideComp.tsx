import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import {
    useScreenManagerContext, useScreenManagerEvents,
} from './managers/screenManagerHooks';

export default function ScreenSlideComp() {
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
    }, [div.current]);
    return (
        <div id='slide' ref={div}
            style={screenSlideManager.containerStyle}
        />
    );
}
