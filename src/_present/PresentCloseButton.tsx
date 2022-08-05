import './PresentCloseButton.scss';

import appProvider from '../server/appProvider';

function closeWin() {
    appProvider.messageUtils.sendData('present:app:hide-present');
}

export default function PresentCloseButton() {
    return (
        <button id="close" onClick={() => {
            closeWin();
        }}>x</button>
    );
}
