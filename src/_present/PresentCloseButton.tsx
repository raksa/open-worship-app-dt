import './PresentCloseButton.scss';
import PresentManager from './PresentManager';

export default function PresentCloseButton({
    presentManager,
}: {
    presentManager: PresentManager,
}) {
    return (
        <button id="close" onClick={() => {
            presentManager.close();
        }}>x</button>
    );
}
