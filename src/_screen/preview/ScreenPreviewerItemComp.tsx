import './CustomHTMLScreenPreviewer';

import { useState } from 'react';

import { extractDropData } from '../../helper/dragHelpers';
import { openContextMenu } from './screenPreviewerHelpers';
import { useScreenManagerContext } from '../managers/screenManagerHooks';
import { useAppEffect } from '../../helper/debuggerHelpers';
import ScreenPreviewerHeaderComp from './ScreenPreviewerHeaderComp';
import ScreenPreviewerFooterComp from './ScreenPreviewerFooterComp';

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
                    // When bible verse text scroll into view, element will be
                    // scrolled to top. This is a workaround to prevent that.
                    event.currentTarget.scrollTop = 0;
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <mini-screen-previewer-custom-html
                    screenId={screenManager.screenId}
                />
            </div>
            <ScreenPreviewerFooterComp />
        </div>
    );
}
