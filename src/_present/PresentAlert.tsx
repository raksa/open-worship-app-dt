import './PresentAlert.scss';

import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import { usePMEvents } from './presentEventHelpers';
import { usePresentManager } from './PresentManager';

export default function PresentAlert() {
    const presentManager = usePresentManager();
    usePMEvents(['resize'], presentManager, () => {
        presentManager.presentAlertManager.renderAll();
    });
    const div = useRef<HTMLDivElement>(null);
    const { presentAlertManager } = presentManager;
    useAppEffect(() => {
        if (div.current) {
            presentAlertManager.div = div.current;
        }
    });
    return (
        <div id='alert' ref={div}
            style={presentAlertManager.containerStyle} >
            <div id='countdown' />
            <div id='marquee' />
            <div id='toast' />
        </div>
    );
}
