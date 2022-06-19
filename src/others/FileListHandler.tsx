import { useEffect, useState } from 'react';
import PathSelector from '../others/PathSelector';
import { toastEventListener } from '../event/ToastEventListener';
import fileHelpers, {
    isSupportedMimetype,
    MimetypeNameType,
} from '../helper/fileHelper';
import { AskingNewName } from './AskingNewName';
import {
    ContextMenuItemType, showAppContextMenu,
} from './AppContextMenu';
import FileSource from '../helper/FileSource';
import {
    previewingEventListener, useOnSelectDir,
} from '../event/PreviewingEventListener';
import { getSetting } from '../helper/settingHelper';
import RenderList from './RenderList';

export type FileListType = FileSource[] | null | undefined

export default function FileListHandler({
    id, mimetype, list, setList, dir, setDir,
    header, body, contextMenu,
    onNewFile,
}: {
    id: string, mimetype: MimetypeNameType,
    list: FileListType,
    setList: (l: FileListType) => void,
    dir: string, setDir: (d: string) => void,
    header?: any, body: any,
    onNewFile?: (n: string) => Promise<boolean>,
    contextMenu?: ContextMenuItemType[]
}) {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    useEffect(() => {
        if (list === null) {
            fileHelpers.listFilesWithMimetype(dir, mimetype).then(setList)
                .catch((error: any) => {
                    setList(undefined);
                    toastEventListener.showSimpleToast({
                        title: 'Listing',
                        message: error.message,
                    });
                });
        }
    }, [list]);
    useOnSelectDir(() => {
        setDir(getSetting(`${id}-selected-dir`) || '');
        setList(null);
    });
    const applyDir = (newDir: string) => {
        setDir(newDir);
        previewingEventListener.selectingDir();
        setList(null);
    };
    return (
        <div className={`${id} card w-100 h-100`}
            onDragOver={(event) => {
                event.preventDefault();
                if (Array.from(event.dataTransfer.items).every((item) => {
                    return isSupportedMimetype(item.type, mimetype);
                })) {
                    event.currentTarget.style.opacity = '0.5';
                }
            }} onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
            }} onDrop={async (event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
                for (const file of Array.from(event.dataTransfer.files)) {
                    const title = 'Copying File';
                    if (!isSupportedMimetype(file.type, mimetype)) {
                        toastEventListener.showSimpleToast({
                            title,
                            message: 'Unsupported file type!',
                        });
                    } else {
                        try {
                            await fileHelpers.copyFileToPath(file.path, file.name, dir);
                            setList(null);
                            toastEventListener.showSimpleToast({
                                title,
                                message: 'File has been copied',
                            });
                        } catch (error: any) {
                            toastEventListener.showSimpleToast({
                                title,
                                message: error.message,
                            });
                        }
                    }
                }
            }}>
            {header && <div className='card-header'>{header}
                {onNewFile && <button className="btn btn-sm btn-outline-info float-end"
                    title="New File"
                    onClick={() => setIsCreatingNew(true)}>
                    <i className="bi bi-file-earmark-plus" />
                </button>}
            </div>}
            <div className='card-body pb-5' onContextMenu={(e: any) => {
                showAppContextMenu(e, [
                    {
                        title: 'Delete All', onClick: () => {
                            // TODO: create prompt
                            const input = window.prompt('Type: delete');
                            if (input === 'delete') {
                                console.log('Delete All');
                            } else {
                                toastEventListener.showSimpleToast({
                                    title: 'Deleting All',
                                    message: 'You can\'t delete all',
                                });
                            }
                        },
                    },
                    ...(contextMenu || []),
                ]);
            }}>
                <PathSelector
                    prefix={`path-${id}`}
                    dirPath={dir}
                    onRefresh={() => setList(null)}
                    onChangeDirPath={applyDir}
                    onSelectDirPath={applyDir} />
                <ul className="list-group">
                    {onNewFile && isCreatingNew && <AskingNewName
                        applyName={async (name) => {
                            if(name === null) {
                                setIsCreatingNew(false);
                                return;
                            }
                            onNewFile(name).then((b) => setIsCreatingNew(b));
                        }} />}
                    <RenderList list={list} setList={setList}
                        body={body} />
                </ul>
            </div>
        </div >
    );
}
