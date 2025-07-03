import './ScreenOtherComp.scss';

import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import {
    useScreenManagerContext,
    useScreenManagerEvents,
} from './managers/screenManagerHooks';

export default function ScreenOtherComp() {
    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['refresh'], screenManager, () => {
        screenManager.screenOtherManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { screenOtherManager } = screenManager;
    useAppEffect(() => {
        if (div.current) {
            screenOtherManager.div = div.current;
        }
    }, [div.current]);
    return (
        <div id="alert" ref={div} style={screenOtherManager.containerStyle} />
    );
}
