import { useRef } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import { usePMEvents } from './presentEventHelpers';
import { usePresentManager } from './PresentManager';

export default function PresentSlide() {
    const presentManager = usePresentManager();
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
