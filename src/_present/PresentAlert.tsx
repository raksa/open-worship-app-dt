import { useRef, useEffect } from 'react';
import './PresentAlert.scss';
import { usePMEvents } from './presentEventHelpers';
import PresentManager from './PresentManager';

export default function PresentAlert({ presentManager }: {
    presentManager: PresentManager;
}) {
    usePMEvents(['resize'], presentManager, () => {
        presentManager.presentAlertManager.renderAll();
    });
    const div = useRef<HTMLDivElement>(null);
    const { presentAlertManager } = presentManager;
    useEffect(() => {
        if (div.current) {
            presentAlertManager.div = div.current;
        }
    });
    return (
        <div id='alert' ref={div}
            style={presentAlertManager.containerStyle} >
            <div id='countdown' />
            <div id='marquee'/>
            <div id='toast'/>
        </div>
    );
}
