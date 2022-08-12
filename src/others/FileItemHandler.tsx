import FileReadError from './FileReadError';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import {
    copyToClipboard, openExplorer,
} from '../server/appHelper';
import FileSource from '../helper/FileSource';
import ItemSource from '../helper/ItemSource';
import { openConfirm } from '../alert/HandleAlert';
import appProvider from '../server/appProvider';
import { useFSEvents } from '../helper/dirSourceHelpers';

export const genCommonMenu = (fileSource: FileSource) => {
    return [
        {
            title: 'Copy Path to Clipboard', onClick: () => {
                copyToClipboard(fileSource.filePath);
            },
        },
        {
            title: `Reveal in ${appProvider.systemUtils.isMac ?
                'Finder' : 'File Explorer'}`,
            onClick: () => {
                openExplorer(fileSource.filePath);
            },
        },
    ];
};
export default function FileItemHandler({
    data, reload, index, fileSource, className,
    contextMenu, onDrop, onClick,
    child, isPointer, onDelete,
}: {
    data: ItemSource<any> | null | undefined,
    reload: () => void,
    index: number,
    fileSource: FileSource,
    className?: string
    contextMenu?: ContextMenuItemType[],
    onDrop?: (e: any) => void,
    onClick?: () => void,
    child: any,
    isPointer?: boolean,
    onDelete?: () => void,
}) {
    useFSEvents(['select'], fileSource);
    const applyClick = () => {
        fileSource.fireSelectEvent();
        onClick && onClick();
    };
    const selfContextMenu = [
        {
            title: 'Reload', onClick: () => {
                reload();
            },
        }, {
            title: 'Delete', onClick: async () => {
                const isOk = await openConfirm(`Deleting "${fileSource.fileName}"`,
                    'Are you sure to delete this file?');
                if (isOk) {
                    await fileSource.delete();
                    onDelete && onDelete();
                }
            },
        }];
    if (data === null) {
        return null;
    }
    if (data === undefined) {
        return <FileReadError onContextMenu={(event) => {
            showAppContextMenu(event, selfContextMenu);
        }} />;
    }
    const moreClassName = `${data.isSelected ? 'active' : ''} ${className || ''}`;
    return (
        <li className={`list-group-item mx-1 ${moreClassName} ${isPointer ? 'pointer' : ''}`}
            onClick={applyClick}
            data-index={index + 1}
            title={fileSource.filePath}
            onContextMenu={(event) => {
                showAppContextMenu(event, [
                    ...(contextMenu || []),
                    ...genCommonMenu(fileSource),
                    ...selfContextMenu,
                ]);
            }}
            onDragOver={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    event.currentTarget.classList
                        .add('receiving-child');
                }
            }}
            onDragLeave={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    event.currentTarget.classList
                        .remove('receiving-child');
                }
            }}
            onDrop={(event) => {
                if (onDrop) {
                    event.currentTarget.classList
                        .remove('receiving-child');
                    onDrop(event);
                }
            }}>
            {child}
        </li>
    );
}
