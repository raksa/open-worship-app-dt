import { useEffect, useState } from 'react';
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

export default function FileListHandler({
    id, mimetype, dirSource, setDirSource,
    header, body, contextMenu,
    onNewFile,
}: {
    id: string, mimetype: MimetypeNameType,
    dirSource: DirSource,
    setDirSource: (ds: DirSource) => void,
    header?: any, body: any,
    onNewFile?: (n: string) => Promise<boolean>,
    contextMenu?: ContextMenuItemType[]
}) {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const settingName = dirSource.settingName;
    const getNewDirSource = () => {
        return DirSource.genDirSource(settingName, true);
    };
    const refresh = async () => {
        const newDirSource = getNewDirSource();
        await newDirSource.listFiles(mimetype);
        setDirSource(newDirSource);
    };

    useEffect(() => {
        if (dirSource.fileSources === null) {
            refresh();
        }
        const refreshEvents = dirSource.registerEventListener(['refresh'], refresh);
        const reloadEvents = dirSource.registerEventListener(['reload'], () => {
            dirSource.deleteCache();
            setDirSource(getNewDirSource());
        });
        return () => {
            dirSource.unregisterEventListener(refreshEvents);
            dirSource.unregisterEventListener(reloadEvents);
        };
    }, [dirSource]);
    return (
        <div className={`${id} card w-100 h-100`}
            onDragOver={(event) => {
                if (!dirSource.dirPath) {
                    return;
                }
                event.preventDefault();
                if (Array.from(event.dataTransfer.files).every((item) => {
                    return isSupportedExt(item.name, mimetype);
                })) {
                    event.currentTarget.style.opacity = '0.5';
                }
            }} onDragLeave={(event) => {
                if (!dirSource.dirPath) {
                    return;
                }
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
            }} onDrop={async (event) => {
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
            }}>
            {header && <div className='card-header'>{header}
                {onNewFile && dirSource.dirPath &&
                    <button className='btn btn-sm btn-outline-info float-end'
                        title='New File'
                        onClick={() => setIsCreatingNew(true)}>
                        <i className='bi bi-file-earmark-plus' />
                    </button>
                }
            </div>}
            <div className='card-body pb-5' onContextMenu={(e: any) => {
                showAppContextMenu(e, [
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
            }}>
                <PathSelector prefix={`path-${id}`}
                    dirSource={dirSource} />
                <ul className='list-group'>
                    {onNewFile && isCreatingNew && <AskingNewName
                        applyName={async (name) => {
                            if (name === null) {
                                setIsCreatingNew(false);
                                return;
                            }
                            onNewFile(name).then((b) => setIsCreatingNew(b));
                        }} />}
                    <RenderList dirSource={dirSource} body={body} />
                </ul>
            </div>
        </div >
    );
}
