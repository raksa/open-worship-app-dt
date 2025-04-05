import {
    fsCopyFilePathToPath,
    isSupportedExt,
    MimetypeNameType,
} from '../server/fileHelpers';
import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import DirSource from '../helper/DirSource';
import { showSimpleToast } from '../toast/toastHelpers';
import { selectFiles } from '../server/appHelpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';

function changeDragEventStyle(
    event: React.DragEvent<HTMLDivElement>,
    key: string,
    value: string,
) {
    (event.currentTarget.style as any)[key] = value;
}

export function genOnDragOver(dirSource: DirSource) {
    return (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const items = Object.entries(event.dataTransfer.items);
        if (!dirSource.dirPath) {
            changeDragEventStyle(event, 'opacity', '0.5');
            return;
        }
        if (
            items.length > 0 &&
            items.every(([_, { kind }]) => {
                return kind === 'file';
            })
        ) {
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

export type DroppedFileType = File | string;

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
            const entry: FileSystemFileHandle = await (
                item as any
            ).getAsFileSystemHandle();
            if ((entry as any).kind === 'directory') {
                yield* readDirectory(entry);
            } else {
                const file = await entry.getFile();
                yield file;
            }
        }
    }
}

function checkAndCopyFiles(
    {
        checkIsValidFile,
        takeFile,
    }: {
        checkIsValidFile: (fileFullName: string) => boolean;
        takeFile?: (file: DroppedFileType | string) => boolean;
    },
    dirPath: string,
    file: DroppedFileType | string,
) {
    const isString = typeof file === 'string';
    if (!takeFile?.(file) && checkIsValidFile(isString ? file : file.name)) {
        return fsCopyFilePathToPath(file, dirPath);
    }
    return null;
}

export function genOnDrop({
    dirSource,
    mimetypeName,
    checkIsExtraFile,
    takeDroppedFile,
}: {
    dirSource: DirSource;
    mimetypeName: MimetypeNameType;
    checkIsExtraFile?: (fileFullName: string) => boolean;
    takeDroppedFile?: (file: DroppedFileType) => boolean;
}) {
    const checkIsValidFile = (fileFullName: string) => {
        return (
            checkIsExtraFile?.(fileFullName) ||
            isSupportedExt(fileFullName, mimetypeName)
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
        for await (const file of readDroppedFiles(event)) {
            const copyingPromise = checkAndCopyFiles(
                {
                    checkIsValidFile,
                    takeFile: takeDroppedFile,
                },
                dirSource.dirPath,
                file,
            );
            if (copyingPromise !== null) {
                promises.push(copyingPromise);
            }
        }
        await Promise.all(promises);
    };
}

export type FileSelectionOptionType = {
    windowTitle: string;
    extensions: string[];

    dirPath: string;
    onFileSelected?: (filePaths: string[]) => void;
    takeSelectedFile?: (filePath: string) => boolean;
};

export async function handleFilesSelectionMenuItem(
    fileSelectionOption: FileSelectionOptionType,
) {
    const {
        dirPath,
        windowTitle,
        extensions,
        onFileSelected,
        takeSelectedFile,
    } = fileSelectionOption;
    const filePaths = selectFiles([{ name: windowTitle, extensions }]);
    onFileSelected?.(filePaths);
    const promises = [];
    for (const filePath of filePaths) {
        const copyingPromise = checkAndCopyFiles(
            {
                checkIsValidFile: () => true,
                takeFile: () => {
                    return !!takeSelectedFile?.(filePath);
                },
            },
            dirPath,
            filePath,
        );
        if (copyingPromise !== null) {
            promises.push(copyingPromise);
        }
    }
    await Promise.all(promises);
}

export function genOnContextMenu(
    contextMenu?: ContextMenuItemType[],
    addItems?: () => void,
) {
    return (event: React.MouseEvent<any>) => {
        const menuItems: ContextMenuItemType[] = [...(contextMenu ?? [])];
        if (addItems !== undefined) {
            menuItems.push({
                menuTitle: 'Add Items',
                onSelect: addItems,
            });
        }
        if (menuItems.length === 0) {
            return;
        }
        showAppContextMenu(event as any, menuItems);
    };
}
