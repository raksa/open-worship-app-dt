import React, { useCallback, useState } from 'react';
import PathSelector from '../others/PathSelector';
import {
    MimetypeNameType,
} from '../server/fileHelper';
import {
    ContextMenuItemType,
} from './AppContextMenu';
import FileSource from '../helper/FileSource';
import RenderList from './RenderList';
import DirSource from '../helper/DirSource';
import {
    genOnDragOver,
    genOnDragLeave,
    genOnDrop,
    genOnContextMenu,
} from './droppingFileHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import appProvider from '../server/appProvider';
import { useDSEvents } from '../helper/dirSourceHelpers';
import { useRefresh } from '../helper/helpers';

const AskingNewName = React.lazy(() => {
    return import('./AskingNewName');
});

function watch(dirSource: DirSource, signal: AbortSignal) {
    if (!dirSource.isDirPathValid) {
        return;
    }
    appProvider.fileUtils.watch(dirSource.dirPath, {
        signal,
    }, (eventType, fileName) => {
        if (eventType === 'rename') {
            dirSource.fireReloadEvent();
        } else if (eventType === 'change') {
            dirSource.fireReloadFileEvent(fileName);
        }
    });
}

export type FileListType = FileSource[] | null | undefined

export default function FileListHandler({
    id, mimetype, dirSource, header, bodyHandler,
    contextMenu, onNewFile, checkExtraFile,
    takeDroppedFile,
}: {
    id: string, mimetype: MimetypeNameType,
    dirSource: DirSource,
    header?: any,
    bodyHandler: (fileSources: FileSource[]) => any,
    onNewFile?: (newName: string) => Promise<boolean>,
    contextMenu?: ContextMenuItemType[],
    checkExtraFile?: (fileSource: FileSource) => boolean,
    takeDroppedFile?: (file: FileSource) => boolean,
}) {
    const refresh = useRefresh();
    const applyNameCallback = useCallback(async (name: string | null) => {
        if (name === null) {
            setIsCreatingNew(false);
            return;
        }
        onNewFile?.(name).then((isSuccess) => {
            setIsCreatingNew(isSuccess);
        });
    }, [onNewFile]);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    useAppEffect(() => {
        const abortController = new AbortController();
        watch(dirSource, abortController.signal);
        return () => {
            abortController.abort();
        };
    }, [dirSource.dirPath]);
    useDSEvents(['path'], dirSource, () => {
        refresh();
        dirSource.fireReloadEvent();
    });
    return (
        <div className={`${id} card w-100 h-100`}
            onDragOver={genOnDragOver(dirSource, mimetype)}
            onDragLeave={genOnDragLeave()}
            onDrop={genOnDrop({
                dirSource,
                mimetype,
                checkExtraFile,
                takeDroppedFile,
            })}>
            {header && <div className='card-header'>{header}
                {onNewFile && dirSource.dirPath &&
                    <button className='btn btn-sm btn-outline-info float-end'
                        title='New File'
                        onClick={() => setIsCreatingNew(true)}>
                        <i className='bi bi-file-earmark-plus' />
                    </button>
                }
            </div>}
            <div className='card-body pb-5'
                onContextMenu={genOnContextMenu(contextMenu)}>
                <PathSelector prefix={`path-${id}`}
                    dirSource={dirSource} />
                {!dirSource.dirPath ? noDirSelected : (
                    <ul className='list-group'>
                        {onNewFile && isCreatingNew && <AskingNewName
                            applyName={applyNameCallback} />}
                        <RenderList dirSource={dirSource}
                            bodyHandler={bodyHandler}
                            mimetype={mimetype} />
                    </ul>
                )}
            </div>
        </div >
    );
}

const noDirSelected = (
    <div className='card-body pb-5'>
        <div className='alert alert-info'>
            <i className='bi bi-info-circle' />
            <span className='ms-2'>No directory selected</span>
        </div>
    </div>
);
