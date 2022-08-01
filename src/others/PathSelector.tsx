import './PathSelector.scss';

import {
    copyToClipboard, isMac, openExplorer,
} from '../helper/appHelper';
import { showAppContextMenu } from './AppContextMenu';
import { useStateSettingBoolean } from '../helper/settingHelper';
import DirSource from '../helper/DirSource';
import React from 'react';
import AppSuspense from './AppSuspense';

const PathPreviewer = React.lazy(() => import('./PathPreviewer'));

export default function PathSelector({
    dirSource, prefix,
}: {
    dirSource: DirSource,
    prefix: string
}) {
    const [showing, setShowing] = useStateSettingBoolean(`${prefix}-selector-opened`, false);
    const isShowing = !dirSource.dirPath || showing;
    return (
        <div className='path-selector w-100'
            onContextMenu={(e) => {
                showAppContextMenu(e, [
                    {
                        title: 'Copy to Clipboard',
                        onClick: () => {
                            copyToClipboard(dirSource.dirPath);
                        },
                    },
                    {
                        title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                        onClick: () => {
                            openExplorer(dirSource.dirPath);
                        },
                    },
                ]);
            }}>
            <div className='d-flex path-previewer pointer' onClick={() => {
                setShowing(!showing);
            }}>
                <i className={`bi ${isShowing ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                {dirSource.dirPath && <div className='ellipsis-left border-white-round px-1 flex-fill'
                    title={dirSource.dirPath}>
                    {dirSource.dirPath}</div>}
                {dirSource.dirPath &&
                    <div className={`px-2 ${dirSource.fileSources === null ? 'rotating' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            dirSource.fireReloadEvent();
                        }}>
                        <i className='bi bi-arrow-clockwise' />
                    </div>
                }
            </div>
            {isShowing && <AppSuspense>
                <PathPreviewer dirSource={dirSource}
                    prefix={prefix} />
            </AppSuspense>}
        </div>
    );
}
