import {
    fsCopyFilePathToPath, isSupportedExt, MimetypeNameType,
} from '../server/fileHelper';
import {
    ContextMenuItemType, showAppContextMenu,
} from './AppContextMenu';
import DirSource from '../helper/DirSource';
import { openConfirm } from '../alert/alertHelpers';
import { showSimpleToast } from '../toast/toastHelpers';

function changeDragEventStyle(event: React.DragEvent<HTMLDivElement>,
    key: string, value: string) {
    (event.currentTarget.style as any)[key] = value;
}

export function genOnDragOver(
    dirSource: DirSource,
) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const items = Object.entries(event.dataTransfer.items);
        if (!dirSource.dirPath) {
            changeDragEventStyle(event, 'opacity', '0.5');
            return;
        }
        if (items.length > 0 && items.every(([_, { kind }]) => {
            return kind === 'file';
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

export type DroppedFileType = File | string

async function* readDroppedFiles(
    event: React.DragEvent<HTMLDivElement>,
): AsyncGenerator<DroppedFileType> {
    async function* readDirectory(
        directoryHandle: FileSystemFileHandle,
    ): AsyncGenerator<DroppedFileType> {
        for await (const [_, handle] of (directoryHandle as any).entries()) {
            if (handle.kind === 'file') {
                const file = await handle.getFile();
                yield file;
            } else if (handle.kind === 'directory') {
                yield* readDirectory(handle);
            }
        }
    }
    for (const item of event.dataTransfer.items) {
        if (item.kind === 'file') {
            const entry: FileSystemFileHandle = (
                await (item as any).getAsFileSystemHandle()
            );
            if ((entry as any).kind === 'directory') {
                yield* readDirectory(entry);
            } else {
                const file = await entry.getFile();
                yield file;
            }
        }
    }
}

export function genOnDrop({
    dirSource, mimetype, checkIsExtraFile, takeDroppedFile,
}: {
    dirSource: DirSource,
    mimetype: MimetypeNameType,
    checkIsExtraFile?: (fileFullName: string) => boolean,
    takeDroppedFile?: (file: DroppedFileType) => boolean,
}) {
    const checkIsValidFile = (fileFullName: string) => {
        return (
            checkIsExtraFile?.(fileFullName) ||
            isSupportedExt(fileFullName, mimetype)
        );
    };
    return async (event: React.DragEvent<HTMLDivElement>) => {
        changeDragEventStyle(event, 'opacity', '1');
        event.preventDefault();
        if (dirSource.dirPath === null) {
            showSimpleToast('Open Folder', 'Please open a folder first');
            return;
        }
        const promises = [];
        for await (
            const file of readDroppedFiles(event)
        ) {
            if (takeDroppedFile?.(file)) {
                continue;
            }
            const isString = typeof file === 'string';
            if (checkIsValidFile(isString ? file : file.name)) {
                promises.push(fsCopyFilePathToPath(file, dirSource.dirPath));
            }
        }
        await Promise.all(promises);
    };
}

export function genOnContextMenu(contextMenu?: ContextMenuItemType[]) {
    return (event: React.MouseEvent<any>) => {
        showAppContextMenu(event as any, [
            {
                menuTitle: 'Delete All',
                onClick: () => {
                    (async () => {
                        const isOk = await openConfirm(
                            'Not implemented',
                            'Read mode is not implemented yet.',
                        );
                        if (isOk) {
                            showSimpleToast(
                                'Deleting All',
                                'Not implemented, need input "delete all"',
                            );
                        }
                    })();
                },
            },
            ...(contextMenu || []),
        ]);
    };
}
