import './CustomHTMLScreenPreviewer';

import { useState } from 'react';

import ShowHideScreen from './ShowHideScreen';
import MiniScreenClearControlComp from './MiniScreenClearControlComp';
import DisplayControl from './DisplayControl';
import ScreenEffectControlComp from './ScreenEffectControlComp';
import { extractDropData } from '../../helper/dragHelpers';
import { openContextMenu } from './screenPreviewerHelpers';
import ItemColorNoteComp from '../../others/ItemColorNoteComp';
import {
    useScreenManagerBaseContext,
    useScreenManagerContext,
} from '../managers/screenManagerHooks';
import { useAppEffect } from '../../helper/debuggerHelpers';

function ScreenPreviewerHeaderComp() {
    const screenManagerBase = useScreenManagerBaseContext();
    return (
        <div
            className="card-header w-100 pb-2"
            style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '35px',
            }}
        >
            <div className="d-flex w-100 h-100">
                <div className="d-flex justify-content-start">
                    <ShowHideScreen />
                    <MiniScreenClearControlComp />
                    <div className="ms-2">
                        <ItemColorNoteComp item={screenManagerBase} />
                    </div>
                </div>
                <div className="flex-fill d-flex justify-content-end ms-2">
                    <DisplayControl />
                    <ScreenEffectControlComp />
                </div>
            </div>
        </div>
    );
}

export default function ScreenPreviewerItemComp({
    width,
}: Readonly<{
    width: number;
}>) {
    const screenManager = useScreenManagerContext();
    const [screenManagerDim, setScreenManagerDim] = useState({
        width: screenManager.width,
        height: screenManager.height,
    });
    useAppEffect(() => {
        const handleResize = () => {
            setScreenManagerDim({
                width: screenManager.width,
                height: screenManager.height,
            });
        };
        const registeredEvent = screenManager.registerEventListener(
            ['display-id'],
            handleResize,
        );
        return () => {
            screenManager.unregisterEventListener(registeredEvent);
        };
    }, [screenManager]);
    const selectedCN = screenManager.isSelected ? 'highlight-selected' : '';
    const height = Math.ceil(
        width * (screenManagerDim.height / screenManagerDim.width),
    );
    return (
        <div
            key={screenManager.key}
            title={`Screen: ${screenManager.screenId}`}
            className={`mini-screen card m-1 ${selectedCN}`}
            style={{
                overflow: 'hidden',
                width: `${width}px`,
                display: 'inline-block',
                verticalAlign: 'top',
            }}
            onContextMenu={(event) => {
                openContextMenu(event, screenManager);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.classList.add('receiving-child');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.classList.remove('receiving-child');
            }}
            onDrop={async (event) => {
                event.currentTarget.classList.remove('receiving-child');
                const droppedData = await extractDropData(event);
                if (droppedData === null) {
                    return;
                }
                screenManager.receiveScreenDropped(droppedData);
            }}
        >
            <ScreenPreviewerHeaderComp />
            <div
                className="w-100 overflow-hidden"
                style={{
                    height: `${height}px`,
                }}
                onScroll={(event) => {
                    event.currentTarget.scrollTop = 0;
                }}
            >
                <mini-screen-previewer-custom-html
                    screenId={screenManager.screenId}
                />
            </div>
            <div></div>
        </div>
    );
}
