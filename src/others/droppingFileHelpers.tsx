import ToastEventListener from '../event/ToastEventListener';
import {
    fsCopyFileToPath,
    isSupportedExt,
    MimetypeNameType,
} from '../server/fileHelper';
import {
    ContextMenuItemType, showAppContextMenu,
} from './AppContextMenu';
import FileSource from '../helper/FileSource';
import DirSource from '../helper/DirSource';
import { openConfirm } from '../alert/HandleAlert';

export function genOnDrag(dirSource: DirSource, mimetype: MimetypeNameType) {
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
export function genOnDragLeave(dirSource: DirSource) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        if (!dirSource.dirPath) {
            return;
        }
        event.preventDefault();
        event.currentTarget.style.opacity = '1';
    };
}
export function genOnDrop({
    dirSource,
    mimetype,
    isSupportedDroppedFile,
    takeDroppedFile,
}: {
    dirSource: DirSource,
    mimetype: MimetypeNameType,
    isSupportedDroppedFile?: (fileSource: FileSource) => boolean,
    takeDroppedFile?: (file: FileSource) => boolean,
}) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        if (!dirSource.dirPath) {
            return;
        }
        event.preventDefault();
        event.currentTarget.style.opacity = '1';
        Array.from(event.dataTransfer.files).forEach(async (file) => {
            const fileSource = FileSource.getInstance((file as any).path);
            if (takeDroppedFile && !takeDroppedFile(fileSource)) {
                return;
            }
            const title = 'Copying File';
            if (isSupportedDroppedFile?.(fileSource) ||
                !isSupportedExt(fileSource.fileName, mimetype)) {
                ToastEventListener.showSimpleToast({
                    title,
                    message: 'Unsupported file type!',
                });
            } else {
                try {
                    await fsCopyFileToPath(fileSource.filePath,
                        fileSource.fileName, dirSource.dirPath);
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

export function genOnContextMenu(contextMenu?: ContextMenuItemType[]) {
    return (event: React.MouseEvent<any>) => {
        showAppContextMenu(event as any, [
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
