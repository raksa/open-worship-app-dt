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
import { openConfirm } from '../alert/alertHelpers';
import { showSimpleToast } from '../toast/toastHelpers';

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
    checkExtraFile,
    takeDroppedFile,
}: {
    dirSource: DirSource,
    mimetype: MimetypeNameType,
    checkExtraFile?: (fileSource: FileSource) => boolean,
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
            if (takeDroppedFile && takeDroppedFile(fileSource)) {
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
                    dirSource.fireReloadEvent();
                } catch (error: any) {
                    showSimpleToast(title, error.message);
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
                        showSimpleToast('Deleting All',
                            'Not implemented, need input "delete all"');
                    }
                },
            },
            ...(contextMenu || []),
        ]);
    };
}
