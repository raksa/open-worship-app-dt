import './CustomHTMLScreenPreviewer';

import ShowHideScreen from './ShowHideScreen';
import MiniScreenClearControlComp from './MiniScreenClearControlComp';
import { useScreenManagerContext } from '../ScreenManager';
import DisplayControl from './DisplayControl';
import PTEffectControl from './PTEffectControl';
import { handleDrop } from '../../helper/dragHelpers';
import { openContextMenu } from './screenPreviewerHelpers';
import ItemColorNote from '../../others/ItemColorNote';

function ScreenPreviewerHeaderComp() {
    const screenManager = useScreenManagerContext();
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
                        <ItemColorNote item={screenManager} />
                    </div>
                </div>
                <div className='flex-fill d-flex justify-content-end ms-2'>
                    <DisplayControl />
                    <PTEffectControl />
                </div>
            </div>
        </div>
    );
}

export default function ScreenPreviewerItemComp({ width }: Readonly<{
    width: number,
}>) {
    const screenManager = useScreenManagerContext();
    const selectedCN = screenManager.isSelected ? 'highlight-selected' : '';
    return (
        <div key={screenManager.key}
            title={`Screen: ${screenManager.screenId}`}
            className={`mini-screen card m-1 ${selectedCN}`}
            style={{
                overflow: 'hidden',
                width: `${width}px`,
                display: 'inline-block',
            }}
            onContextMenu={(event) => {
                openContextMenu(event, screenManager);
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
                screenManager.receiveScreenDropped(droppedData);
            }}>
            <ScreenPreviewerHeaderComp />
            <div className='w-100'>
                <mini-screen-previewer-custom-html
                    screenId={screenManager.screenId}
                />
            </div>
            <div></div>
        </div>
    );
}
