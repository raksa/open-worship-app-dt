import { useState } from 'react';
import PathSelector from '../others/PathSelector';
import ToastEventListener from '../event/ToastEventListener';
import {
    fsCopyFileToPath,
    isSupportedExt,
    MimetypeNameType,
} from '../server/fileHelper';
import { AskingNewName } from './AskingNewName';
import {
    ContextMenuItemType, showAppContextMenu,
} from './AppContextMenu';
import FileSource from '../helper/FileSource';
import RenderList from './RenderList';
import DirSource from '../helper/DirSource';
import { openConfirm } from '../alert/HandleAlert';

export type FileListType = FileSource[] | null | undefined

function genOnDrag(dirSource: DirSource, mimetype: MimetypeNameType) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        if (!dirSource.dirPath) {
            return;
        }
        event.preventDefault();
        if (Array.from(event.dataTransfer.files).every((item) => {
            return isSupportedExt(item.name, mimetype);
        })) {
            event.currentTarget.style.opacity = '0.5';
        }
    };
}
function genOnDragLeave(dirSource: DirSource) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        if (!dirSource.dirPath) {
            return;
        }
        event.preventDefault();
        event.currentTarget.style.opacity = '1';
    };
}
function genOnDrop(dirSource: DirSource, mimetype: MimetypeNameType) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        if (!dirSource.dirPath) {
            return;
        }
        event.preventDefault();
        event.currentTarget.style.opacity = '1';
        Array.from(event.dataTransfer.files).forEach(async (file) => {
            const title = 'Copying File';
            if (!isSupportedExt(file.name, mimetype)) {
                ToastEventListener.showSimpleToast({
                    title,
                    message: 'Unsupported file type!',
                });
            } else {
                try {
                    await fsCopyFileToPath((file as any).path,
                        file.name, dirSource.dirPath);
                    ToastEventListener.showSimpleToast({
                        title,
                        message: 'File has been copied',
                    });
                    dirSource.fireReloadEvent();
                } catch (error: any) {
                    ToastEventListener.showSimpleToast({
                        title,
                        message: error.message,
                    });
                }
            }
        });
    };
}

function genOnContextMenu(contextMenu?: ContextMenuItemType[]) {
    return (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        showAppContextMenu(event, [
            {
                title: 'Delete All', onClick: async () => {
                    const isOk = await openConfirm('Not implemented',
                        'Read mode is not implemented yet.');
                    if (isOk) {
                        ToastEventListener.showSimpleToast({
                            title: 'Deleting All',
                            message: 'Not implemented, need input "delete all"',
                        });
                    }
                },
            },
            ...(contextMenu || []),
        ]);
    };
}

export default function FileListHandler({
    id, mimetype, dirSource,
    header, body, contextMenu,
    onNewFile,
}: {
    id: string, mimetype: MimetypeNameType,
    dirSource: DirSource,
    header?: any,
    body: (fileSources: FileSource[]) => any,
    onNewFile?: (n: string) => Promise<boolean>,
    contextMenu?: ContextMenuItemType[]
}) {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    return (
        <div className={`${id} card w-100 h-100`}
            onDragOver={genOnDrag(dirSource, mimetype)}
            onDragLeave={genOnDragLeave(dirSource)}
            onDrop={genOnDrop(dirSource, mimetype)}>
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
                        applyName={async (name) => {
                            if (name === null) {
                                setIsCreatingNew(false);
                                return;
                            }
                            onNewFile(name).then((b) => {
                                setIsCreatingNew(b);
                            });
                        }} />}
                    <RenderList dirSource={dirSource}
                        body={body}
                        mimetype={mimetype} />
                </ul>
            </div>
        </div >
    );
}
