import './CustomHTMLScreenPreviewer';

import ShowHideScreen from './ShowHideScreen';
import MiniScreenClearControlComp from './MiniScreenClearControlComp';
import DisplayControl from './DisplayControl';
import ScreenEffectControlComp from './ScreenEffectControlComp';
import { handleDrop } from '../../helper/dragHelpers';
import { openContextMenu } from './screenPreviewerHelpers';
import ItemColorNote from '../../others/ItemColorNote';
import {
    useScreenManagerBaseContext,
} from '../managers/screenManagerBaseHelpers';

function ScreenPreviewerHeaderComp() {
    const screenManagerBase = useScreenManagerBaseContext();
    return (
        <div className='card-header w-100 pb-2'
            style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '35px',
            }}>
            <div className='d-flex w-100 h-100'>
                <div className='d-flex justify-content-start'>
                    <ShowHideScreen />
                    <MiniScreenClearControlComp />
                    <div className='ms-2'>
                        <ItemColorNote item={screenManagerBase} />
                    </div>
                </div>
                <div className='flex-fill d-flex justify-content-end ms-2'>
                    <DisplayControl />
                    <ScreenEffectControlComp />
                </div>
            </div>
        </div>
    );
}

export default function ScreenPreviewerItemComp({ width }: Readonly<{
    width: number,
}>) {
    const screenManagerBase = useScreenManagerBaseContext();
    const selectedCN = screenManagerBase.isSelected ? 'highlight-selected' : '';
    return (
        <div key={screenManagerBase.key}
            title={`Screen: ${screenManagerBase.screenId}`}
            className={`mini-screen card m-1 ${selectedCN}`}
            style={{
                overflow: 'hidden',
                width: `${width}px`,
                display: 'inline-block',
            }}
            onContextMenu={(event) => {
                openContextMenu(event, screenManagerBase);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.classList
                    .add('receiving-child');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.classList
                    .remove('receiving-child');
            }}
            onDrop={async (event) => {
                event.currentTarget.classList.remove('receiving-child');
                const droppedData = await handleDrop(event);
                if (droppedData === null) {
                    return;
                }
                screenManagerBase.receiveScreenDropped(droppedData);
            }}>
            <ScreenPreviewerHeaderComp />
            <div className='w-100'>
                <mini-screen-previewer-custom-html
                    screenId={screenManagerBase.screenId}
                />
            </div>
            <div></div>
        </div>
    );
}
