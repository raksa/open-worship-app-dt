import {
    createContext, lazy, useState,
} from 'react';

import PathSelector from '../others/PathSelector';
import {
    MimetypeNameType, fsCheckDirExist,
} from '../server/fileHelpers';
import {
    ContextMenuItemType,
} from './AppContextMenu';
import FileSource from '../helper/FileSource';
import RenderList from './RenderList';
import DirSource from '../helper/DirSource';
import {
    genOnDragOver, genOnDragLeave, genOnDrop, genOnContextMenu,
    DroppedFileType, FileSelectionOptionType,
    handleFilesSelectionMenuItem,
} from './droppingFileHelpers';
import appProvider from '../server/appProvider';
import { useAppEffect } from '../helper/debuggerHelpers';
import { handleError } from '../helper/errorHelpers';
import NoDirSelected from './NoDirSelected';

const LazyAskingNewName = lazy(() => {
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
            }
        });
    } catch (error) {
        handleError(error);
    }
}

export const DirSourceContext = createContext<DirSource | null>(null);

export type FileListType = FileSource[] | null | undefined

export default function FileListHandler({
    id, mimetypeName, dirSource, header, bodyHandler, contextMenu, onNewFile,
    checkExtraFile, takeDroppedFile, userClassName, defaultFolderName,
    fileSelectionOption,
}: Readonly<{
    id: string, 
    mimetypeName: MimetypeNameType,
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
    fileSelectionOption?: FileSelectionOptionType,
}>) {
    const handleNameApplying = async (name: string | null) => {
        if (name === null) {
            setIsCreatingNew(false);
            return;
        }
        onNewFile?.(dirSource.dirPath, name).then((isSuccess) => {
            setIsCreatingNew(isSuccess);
        });
    };
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    useAppEffect(() => {
        const abortController = new AbortController();
        watch(dirSource, abortController.signal);
        return () => {
            abortController.abort();
        };
    }, [dirSource.dirPath]);
    const handleItemsAdding = (
        fileSelectionOption === undefined ? undefined : () => {
            handleFilesSelectionMenuItem(fileSelectionOption);
        }
    );
    return (
        <DirSourceContext value={dirSource}>
            <div className={`${id} card w-100 h-100 ${userClassName ?? ''}`}
                onDragOver={genOnDragOver(dirSource)}
                onDragLeave={genOnDragLeave()}
                onDrop={genOnDrop({
                    dirSource, mimetypeName: mimetypeName,
                    checkIsExtraFile: checkExtraFile,
                    takeDroppedFile,
                })}>
                {header && (
                    <div className='card-header'>{header}
                        {onNewFile && dirSource.dirPath && (
                            <button
                                className={
                                    'btn btn-sm btn-outline-info float-end'
                                }
                                title='New File'
                                onClick={() => setIsCreatingNew(true)}>
                                <i className='bi bi-file-earmark-plus' />
                            </button>
                        )}
                    </div>
                )}
                <div className='card-body d-flex flex-column'
                    onContextMenu={genOnContextMenu(
                        contextMenu, handleItemsAdding,
                    )}>
                    <PathSelector prefix={`path-${id}`}
                        dirSource={dirSource}
                        addItems={handleItemsAdding}
                    />
                    {!dirSource.dirPath ?
                        <NoDirSelected dirSource={dirSource}
                            defaultFolderName={defaultFolderName}
                        /> :
                        (
                            <ul className='list-group flex-fill d-flex'>
                                {onNewFile && isCreatingNew && (
                                    <LazyAskingNewName
                                        applyName={handleNameApplying}
                                    />
                                )}
                                <RenderList dirSource={dirSource}
                                    bodyHandler={bodyHandler}
                                    mimetypeName={mimetypeName}
                                />
                            </ul>
                        )}
                </div>
            </div >
        </DirSourceContext>
    );
}
