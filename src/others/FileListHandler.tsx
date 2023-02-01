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
    genOnDrag,
    genOnDragLeave,
    genOnDrop,
    genOnContextMenu,
} from './droppingFileHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import appProvider from '../server/appProvider';

const AskingNewName = React.lazy(() => {
    return import('./AskingNewName');
});

function watch(dirPath: string, signal: AbortSignal,
    callback: (eventType: string, filename: string) => void) {
    appProvider.fileUtils.watch(dirPath, {
        signal,
    }, (eventType, filename) => {
        callback(eventType as any, filename);
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
        watch(dirSource.dirPath, abortController.signal,
            (eventType, filename) => {
                // TODO: use event to update file list
                console.log('watch', eventType, filename);
            });
        return () => {
            abortController.abort();
        };
    }, [dirSource.dirPath]);
    return (
        <div className={`${id} card w-100 h-100`}
            onDragOver={genOnDrag(dirSource, mimetype)}
            onDragLeave={genOnDragLeave(dirSource)}
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
                <ul className='list-group'>
                    {onNewFile && isCreatingNew && <AskingNewName
                        applyName={applyNameCallback} />}
                    <RenderList dirSource={dirSource}
                        bodyHandler={bodyHandler}
                        mimetype={mimetype} />
                </ul>
            </div>
        </div >
    );
}
