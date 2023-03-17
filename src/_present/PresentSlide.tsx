import { useRef } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import { usePMEvents } from './presentEventHelpers';
import PresentManager from './PresentManager';

export default function PresentSlide({ presentManager }: {
    presentManager: PresentManager;
}) {
    usePMEvents(['resize'], presentManager, () => {
        presentManager.presentSlideManager.render();
    });
    const div = useRef<HTMLDivElement>(null);
    const { presentSlideManager } = presentManager;
    useAppEffect(() => {
        if (div.current) {
            presentSlideManager.div = div.current;
        }
    });
    return (
        <div id='slide' ref={div}
            style={presentSlideManager.containerStyle} />
    );
}
