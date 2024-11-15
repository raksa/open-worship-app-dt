import './PresentCloseButton.scss';

import { usePresentManager } from './PresentManager';

export default function PresentCloseButton() {
    const presentManager = usePresentManager();
    return (
        <button id="close" onClick={() => {
            presentManager.hide();
        }}>x</button>
    );
}
