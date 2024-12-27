import './ScreenAlertComp.scss';

import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import {
    useScreenManagerContext, useScreenManagerEvents,
} from './managers/screenManagerHooks';

export default function ScreenAlertComp() {
    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['resize'], screenManager, () => {
        screenManager.screenAlertManager.renderAll();
    });
    const div = useRef<HTMLDivElement>(null);
    const { screenAlertManager } = screenManager;
    useAppEffect(() => {
        if (div.current) {
            screenAlertManager.div = div.current;
        }
    }, [div.current]);
    return (
        <div id='alert' ref={div}
            style={screenAlertManager.containerStyle} >
            <div id='countdown' />
            <div id='marquee' />
            <div id='toast' />
        </div>
    );
}
