import './CustomHTMLScreenPreviewer';

import ShowHideScreen from './ShowHideScreen';
import MiniScreenClearControl from './MiniScreenClearControl';
import { useScreenManagerContext } from '../ScreenManager';
import DisplayControl from './DisplayControl';
import PTEffectControl from './PTEffectControl';
import { handleDrop } from '../../bible-list/dragHelpers';
import { openContextMenu } from './screenPreviewerHelpers';

export default function ScreenPreviewerItem({ width }: Readonly<{
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
                screenManager.receiveScreenDrag(droppedData);
            }}>
            <div className='card-header w-100 pb-2'
                style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    height: '35px',
                }}>
                <div className={'d-flex'}>
                    <div className='d-flex justify-content-start'>
                        <ShowHideScreen />
                        <MiniScreenClearControl />
                    </div>
                    <div className='flex-fill d-flex justify-content-end'>
                        <DisplayControl />
                        <PTEffectControl />
                    </div>
                </div>
            </div>
            <div className='w-100'>
                <mini-screen-previewer-custom-html
                    screenId={screenManager.screenId}
                />
            </div>
            <div></div>
        </div>
    );
}
