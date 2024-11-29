import { lazy, useCallback, useState } from 'react';

import FileReadError from './FileReadError';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import {
    copyToClipboard, openExplorer,
} from '../server/appHelper';
import FileSource from '../helper/FileSource';
import ItemSource from '../helper/ItemSource';
import appProvider from '../server/appProvider';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { openConfirm } from '../alert/alertHelpers';
import ItemColorNote from './ItemColorNote';

const RenderRenaming = lazy(() => {
    return import('./RenderRenaming');
});

export const genCommonMenu = (filePath: string): ContextMenuItemType[] => {
    return [
        {
            menuTitle: 'Copy Path to Clipboard', onClick: () => {
                copyToClipboard(filePath);
            },
        },
        {
            menuTitle: (
                `Reveal in ${appProvider.systemUtils.isMac ?
                    'Finder' : 'File Explorer'}`
            ),
            onClick: () => {
                openExplorer(filePath);
            },
        },
    ];
};

function genContextMenu(
    filePath: string, setIsRenaming: (value: boolean) => void,
    reload: () => void, onDelete?: () => void,

): ContextMenuItemType[] {
    return [
        {
            menuTitle: 'Duplicate',
            onClick: () => {
                FileSource.getInstance(filePath).duplicate();
            },
        }, {
            menuTitle: 'Rename',
            onClick: () => {
                setIsRenaming(true);
            },
        }, {
            menuTitle: 'Reload',
            onClick: () => {
                reload();
            },
        }, {
            menuTitle: 'Delete',
            onClick: async () => {
                const fileSource = FileSource.getInstance(filePath);
                const isOk = await openConfirm(
                    `Deleting "${fileSource.fileFullName}"`,
                    'Are you sure to delete this file?',
                );
                if (isOk) {
                    await fileSource.delete();
                    onDelete?.();
                }
            },
        },
    ];
}


export default function FileItemHandler({
    data, reload, index, filePath, className,
    contextMenu, onDrop, onClick, renderChild,
    isPointer, onDelete, isDisabledColorNote,
    userClassName,
}: Readonly<{
    data: ItemSource<any> | null | undefined,
    reload: () => void,
    index: number,
    filePath: string,
    className?: string
    contextMenu?: ContextMenuItemType[],
    onDrop?: (event: any) => void,
    onClick?: () => void,
    renderChild: (lyric: ItemSource<any>) => any,
    isPointer?: boolean,
    onDelete?: () => void,
    isDisabledColorNote?: boolean,
    userClassName?: string,
}>) {
    const [isRenaming, setIsRenaming] = useState(false);
    useFSEvents(['select']);
    const applyClick = () => {
        FileSource.getInstance(filePath).fireSelectEvent();
        onClick?.();
    };
    const selfContextMenu = genContextMenu(
        filePath, setIsRenaming, reload, onDelete,
    );

    const callContextMenu = useCallback((event: any) => {
        showAppContextMenu(event, selfContextMenu);
    }, [selfContextMenu]);
    if (data === null) {
        return null;
    }
    if (data === undefined) {
        return <FileReadError onContextMenu={callContextMenu} />;
    }
    const moreClassName = (
        `${data.isSelected ? 'active' : ''} ` + `${className || ''}`
    );
    const fileSource = FileSource.getInstance(filePath);
    return (
        <li className={`list-group-item mx-1 ${moreClassName} ${userClassName}
        ${isPointer ? 'pointer' : ''}`}
            onClick={applyClick}
            data-index={index + 1}
            title={filePath}
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [
                    ...(contextMenu || []),
                    ...genCommonMenu(filePath),
                    ...selfContextMenu,
                ]);
            }}
            onDragOver={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    event.currentTarget.classList.add('receiving-child');
                }
            }}
            onDragLeave={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    event.currentTarget.classList.remove('receiving-child');
                }
            }}
            onDrop={(event) => {
                if (onDrop) {
                    event.currentTarget.classList.remove('receiving-child');
                    onDrop(event);
                }
            }}>
            {isRenaming ? (
                <RenderRenaming
                    setIsRenaming={setIsRenaming}
                    filePath={filePath}
                />
            ) :
                <>
                    {renderChild(data)}
                    {!isDisabledColorNote && (
                        <div className='color-note-container'>
                            <ItemColorNote item={fileSource} />
                        </div>
                    )}
                </>
            }
        </li>
    );
}
