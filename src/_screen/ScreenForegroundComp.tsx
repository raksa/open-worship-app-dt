import './ScreenForegroundComp.scss';

import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import {
    useScreenManagerContext,
    useScreenManagerEvents,
} from './managers/screenManagerHooks';

export default function ScreenForegroundComp() {
    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['refresh'], screenManager, () => {
        screenManager.screenForegroundManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { screenForegroundManager } = screenManager;
    useAppEffect(() => {
        if (div.current) {
            screenForegroundManager.div = div.current;
        }
    }, [div.current]);
    return (
        <div
            id="foreground"
            ref={div}
            style={screenForegroundManager.containerStyle}
        />
    );
}
