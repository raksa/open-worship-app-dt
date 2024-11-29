import {
    createContext, lazy, useCallback, useState,
} from 'react';

import PathSelector from '../others/PathSelector';
import {
    MimetypeNameType, fsCheckDirExist,
} from '../server/fileHelper';
import {
    ContextMenuItemType,
} from './AppContextMenu';
import FileSource from '../helper/FileSource';
import RenderList from './RenderList';
import DirSource from '../helper/DirSource';
import {
    genOnDragOver, genOnDragLeave, genOnDrop, genOnContextMenu,
    DroppedFileType,
} from './droppingFileHelpers';
import appProvider from '../server/appProvider';
import { useAppEffect } from '../helper/debuggerHelpers';
import { handleError } from '../helper/errorHelpers';
import NoDirSelected from './NoDirSelected';

const AskingNewName = lazy(() => {
    return import('./AskingNewName');
});

async function watch(dirSource: DirSource, signal: AbortSignal) {
    const isDirExist = await fsCheckDirExist(dirSource.dirPath);
    if (!isDirExist) {
        return;
    };
    try {
        appProvider.fileUtils.watch(dirSource.dirPath, {
            signal,
        }, (eventType, fileFullName) => {
            if (fileFullName === null) {
                return;
            }
            if (eventType === 'rename') {
                dirSource.fireReloadEvent();
            } else if (eventType === 'change') {
                dirSource.fireReloadFileEvent(fileFullName);
            }
        });
    } catch (error) {
        handleError(error);
    }
}

export const DirSourceContext = createContext<DirSource | null>(null);

export type FileListType = FileSource[] | null | undefined

export default function FileListHandler({
    id, mimetype, dirSource, header, bodyHandler,
    contextMenu, onNewFile, checkExtraFile,
    takeDroppedFile, userClassName,
    defaultFolderName,
}: Readonly<{
    id: string, mimetype: MimetypeNameType,
    dirSource: DirSource,
    header?: any,
    bodyHandler: (filePaths: string[]) => any,
    onNewFile?: (dirPath: string, newName: string) => Promise<boolean>,
    onFileDeleted?: (filePath: string) => void,
    contextMenu?: ContextMenuItemType[],
    checkExtraFile?: (filePath: string) => boolean,
    takeDroppedFile?: (file: DroppedFileType) => boolean,
    userClassName?: string,
    defaultFolderName: string,
}>) {
    const applyNameCallback = useCallback(async (name: string | null) => {
        if (name === null) {
            setIsCreatingNew(false);
            return;
        }
        onNewFile?.(dirSource.dirPath, name).then((isSuccess) => {
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
    return (
        <DirSourceContext.Provider value={dirSource}>
            <div className={`${id} card w-100 h-100 ${userClassName ?? ''}`}
                onDragOver={genOnDragOver(dirSource)}
                onDragLeave={genOnDragLeave()}
                onDrop={genOnDrop({
                    dirSource, mimetype,
                    checkIsExtraFile: checkExtraFile,
                    takeDroppedFile,
                })}>
                {header && <div className='card-header'>{header}
                    {onNewFile && dirSource.dirPath &&
                        <button
                            className='btn btn-sm btn-outline-info float-end'
                            title='New File'
                            onClick={() => setIsCreatingNew(true)}>
                            <i className='bi bi-file-earmark-plus' />
                        </button>
                    }
                </div>}
                <div className='card-body d-flex flex-column'
                    onContextMenu={genOnContextMenu(contextMenu)}>
                    <PathSelector prefix={`path-${id}`}
                        dirSource={dirSource}
                    />
                    {!dirSource.dirPath ?
                        <NoDirSelected dirSource={dirSource}
                            defaultFolderName={defaultFolderName}
                        /> :
                        (
                            <ul className='list-group flex-fill d-flex'>
                                {onNewFile && isCreatingNew && (
                                    <AskingNewName
                                        applyName={applyNameCallback}
                                    />
                                )}
                                <RenderList dirSource={dirSource}
                                    bodyHandler={bodyHandler}
                                    mimetype={mimetype}
                                />
                            </ul>
                        )}
                </div>
            </div >
        </DirSourceContext.Provider>
    );
}
