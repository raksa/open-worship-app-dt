import {
    fsCheckDirExist, fsCopyFileToPath, isSupportedExt, MimetypeNameType,
} from '../server/fileHelper';
import {
    ContextMenuItemType, showAppContextMenu,
} from './AppContextMenu';
import FileSource from '../helper/FileSource';
import DirSource from '../helper/DirSource';
import { openConfirm } from '../alert/alertHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from '../helper/errorHelpers';

function changeDragEventStyle(event: React.DragEvent<HTMLDivElement>,
    key: string, value: string) {
    (event.currentTarget.style as any)[key] = value;
}

export function genOnDragOver(
    dirSource: DirSource, mimetype: MimetypeNameType,
) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const items = Object.entries(event.dataTransfer.items);
        if (!dirSource.dirPath) {
            changeDragEventStyle(event, 'opacity', '0.5');
            return;
        }
        if (items.length > 0 && items.every(([_, { kind, type }]) => {
            const isSupported = kind === 'file' && type.startsWith(mimetype);
            return isSupported;
        })) {
            changeDragEventStyle(event, 'opacity', '0.5');
        }
    };
}

export function genOnDragLeave() {
    return (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        changeDragEventStyle(event, 'opacity', '1');
    };
}

async function getDroppingFolder(files: File[]) {
    for (const file of files) {
        try {
            const filePath = (file as any).path;
            const isDir = await fsCheckDirExist(filePath);
            if (isDir) {
                return filePath;
            }
        } catch (error) {
            handleError(error);
        }
    }
    return null;
}

export function genOnDrop({
    dirSource,
    mimetype,
    checkExtraFile,
    takeDroppedFile,
}: {
    dirSource: DirSource,
    mimetype: MimetypeNameType,
    checkExtraFile?: (filePath: string) => boolean,
    takeDroppedFile?: (filePath: string) => boolean,
}) {
    const handleDroppedFolder = async (droppedPath: string) => {
        if (!dirSource.dirPath) {
            dirSource.dirPath = droppedPath;
            if (droppedPath === null) {
                showSimpleToast('Open Folder', 'Unable to open folder');
            }
            return true;
        } else if (dirSource.dirPath !== droppedPath) {
            const isOk = await openConfirm('Open Folder',
                'Are you sure to open a new folder?');
            if (isOk) {
                dirSource.dirPath = droppedPath;
            }
        }
    };
    const handleDroppedFiles = async (file: File) => {
        const filePath = (file as any).path as string;
        if (takeDroppedFile?.(filePath)) {
            return;
        }
        const fileSource = FileSource.getInstance(filePath);
        const title = 'Copying File';
        if (
            checkExtraFile?.(filePath) ||
            isSupportedExt(fileSource.fileName, mimetype)
        ) {
            try {
                await fsCopyFileToPath(filePath,
                    fileSource.fileName, dirSource.dirPath);
                showSimpleToast(title, 'File has been copied');
            } catch (error: any) {
                showSimpleToast(title, error.message);
            }
        } else {
            showSimpleToast(title, 'Unsupported file type!');
        }
    };
    return async (event: React.DragEvent<HTMLDivElement>) => {
        changeDragEventStyle(event, 'opacity', '1');
        event.preventDefault();

        const files = Array(event.dataTransfer.files).
            reduce((result: File[], fileList) => {
                for (const file of fileList) {
                    result.push(file);
                }
                return result;
            }, []);
        const droppedPath = await getDroppingFolder(files);
        if (droppedPath !== null) {
            handleDroppedFolder(droppedPath);
            return;
        } else if (!dirSource.dirPath) {
            showSimpleToast('Open Folder', 'Unable to open folder');
        }
        for (const file of files) {
            handleDroppedFiles(file);
        }
    };
}

export function genOnContextMenu(contextMenu?: ContextMenuItemType[]) {
    return (event: React.MouseEvent<any>) => {
        showAppContextMenu(event as any, [
            {
                title: 'Delete All',
                onClick: () => {
                    (async () => {
                        const isOk = await openConfirm('Not implemented',
                            'Read mode is not implemented yet.');
                        if (isOk) {
                            showSimpleToast('Deleting All',
                                'Not implemented, need input "delete all"');
                        }
                    })();
                },
            },
            ...(contextMenu || []),
        ]);
    };
}
