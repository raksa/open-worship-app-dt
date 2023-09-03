import {
    fsCheckDirExist,
    fsCopyFileToPath,
    isSupportedExt,
    MimetypeNameType,
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
        if (!dirSource.dirPath) {
            changeDragEventStyle(event, 'opacity', '0.5');
            return;
        }
        if (Array.from(event.dataTransfer.files).every((file) => {
            return isSupportedExt(file.name, mimetype);
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

async function getDroppingFolder(event: React.DragEvent<HTMLDivElement>) {
    if (event.dataTransfer.files.length === 1) {
        const item = event.dataTransfer.files[0] as any;
        try {
            const isDir = await fsCheckDirExist(item.path);
            if (isDir) {
                return item.path;
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
    checkExtraFile?: (fileSource: FileSource) => boolean,
    takeDroppedFile?: (file: FileSource) => boolean,
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
        const fileSource = FileSource.getInstance((file as any).path);
        if (takeDroppedFile?.(fileSource)) {
            return;
        }
        const title = 'Copying File';
        if (checkExtraFile?.(fileSource) ||
            !isSupportedExt(fileSource.fileName, mimetype)) {
            showSimpleToast(title, 'Unsupported file type!');
        } else {
            try {
                await fsCopyFileToPath(fileSource.filePath,
                    fileSource.fileName, dirSource.dirPath);
                showSimpleToast(title, 'File has been copied');
            } catch (error: any) {
                showSimpleToast(title, error.message);
            }
        }
    };
    return async (event: React.DragEvent<HTMLDivElement>) => {
        changeDragEventStyle(event, 'opacity', '1');
        event.preventDefault();
        const droppedPath = await getDroppingFolder(event);
        if (droppedPath !== null) {
            handleDroppedFolder(droppedPath);
            return;
        } else if (!dirSource.dirPath) {
            showSimpleToast('Open Folder', 'Unable to open folder');
        }
        Array.from(event.dataTransfer.files).forEach((file) => {
            handleDroppedFiles(file);
        });
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
            ...(contextMenu ?? []),
        ]);
    };
}
