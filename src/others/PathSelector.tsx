import './PathSelector.scss';

import {
    copyToClipboard,
    openExplorer,
} from '../server/appHelper';
import { showAppContextMenu } from './AppContextMenu';
import { useStateSettingBoolean } from '../helper/settingHelper';
import DirSource from '../helper/DirSource';
import React from 'react';
import AppSuspense from './AppSuspense';
import appProvider from '../server/appProvider';

const PathPreviewer = React.lazy(() => {
    return import('./PathPreviewer');
});

export default function PathSelector({
    dirSource, prefix,
}: {
    dirSource: DirSource,
    prefix: string
}) {
    const [showing, setShowing] = useStateSettingBoolean(
        `${prefix}-selector-opened`, false);
    const dirPath = dirSource.dirPath;
    const isShowing = !dirPath || showing;
    // TODO: check direction rtl error with /*
    const cleanPath = (path: string) => {
        if (path && path[0] === '/') {
            path = path.substring(1);
        }
        return path;
    };
    return (
        <div className='path-selector w-100'
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [
                    {
                        title: 'Copy to Clipboard',
                        onClick: () => {
                            copyToClipboard(dirPath);
                        },
                    },
                    {
                        title: `Reveal in ${appProvider.systemUtils.isMac ?
                            'Finder' : 'File Explorer'}`,
                        onClick: () => {
                            openExplorer(dirPath);
                        },
                    },
                ]);
            }}>
            <div className='d-flex path-previewer pointer'
                onClick={() => {
                    setShowing(!showing);
                }}>
                <i className={`bi ${isShowing ?
                    'bi-chevron-down' : 'bi-chevron-right'}`} />
                {dirPath && <div
                    className='ellipsis-left border-white-round px-1 flex-fill'
                    title={cleanPath(dirPath)}>
                    {cleanPath(dirPath)}</div>}
                {dirPath &&
                    <div className='px-2'
                        onClick={(event) => {
                            event.stopPropagation();
                            dirSource.fireReloadEvent();
                        }}>
                        <i className='bi bi-arrow-clockwise' />
                    </div>
                }
            </div>
            {isShowing && <AppSuspense>
                <PathPreviewer
                    dirSource={dirSource}
                    prefix={prefix} />
            </AppSuspense>}
        </div>
    );
}
