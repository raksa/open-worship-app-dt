import { lazy, useState } from 'react';

import FileReadErrorComp from './FileReadErrorComp';
import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import { copyToClipboard, showExplorer, trashFile } from '../server/appHelpers';
import FileSource from '../helper/FileSource';
import AppDocumentSourceAbs from '../helper/DocumentSourceAbs';
import appProvider from '../server/appProvider';
import { useFileSourceRefreshEvents } from '../helper/dirSourceHelpers';
import { showAppConfirm } from '../popup-widget/popupWidgetHelpers';
import ItemColorNoteComp from './ItemColorNoteComp';
import { menuTitleRealFile, RECEIVING_DROP_CLASSNAME } from '../helper/helpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
const LazyRenderRenamingComp = lazy(() => {
    return import('./RenderRenamingComp');
});

export const genCommonMenu = (filePath: string): ContextMenuItemType[] => {
    return [
        {
            menuElement: 'Copy Path to Clipboard',
            onSelect: () => {
                copyToClipboard(filePath);
            },
        },
        {
            menuElement: menuTitleRealFile,
            onSelect: () => {
                showExplorer(filePath);
            },
        },
    ];
};

function genContextMenu(
    filePath: string,
    setIsRenaming: (value: boolean) => void,
    reload: () => void,
): ContextMenuItemType[] {
    return [
        {
            menuElement: 'Duplicate',
            onSelect: () => {
                FileSource.getInstance(filePath).duplicate();
            },
        },
        {
            menuElement: 'Rename',
            onSelect: () => {
                setIsRenaming(true);
            },
        },
        {
            menuElement: 'Reload',
            onSelect: () => {
                reload();
            },
        },
    ];
}

export function genTrashContextMenu(
    filePath: string,
    onTrashed?: () => void,
): ContextMenuItemType[] {
    return [
        {
            menuElement: 'Move to Trash',
            onSelect: async () => {
                const fileSource = FileSource.getInstance(filePath);
                const isOk = await showAppConfirm(
                    'Moving File to Trash',
                    'Are you sure you want to move ' +
                        `"${fileSource.fileFullName}" to trash?`,
                );
                if (isOk) {
                    await trashFile(filePath);
                    onTrashed?.();
                }
            },
        },
    ];
}

export function genShowOnScreensContextMenu(
    onClick: (event: any) => void,
): ContextMenuItemType[] {
    if (!appProvider.isPagePresenter) {
        return [];
    }
    return [
        {
            menuElement: 'Show on Screens',
            onSelect: onClick,
        },
    ];
}

export default function FileItemHandlerComp({
    data,
    reload,
    index,
    filePath,
    className,
    contextMenuItems,
    onDrop,
    onClick,
    renderChild,
    isPointer,
    onTrashed,
    isDisabledColorNote,
    userClassName,
    isSelected,
    renamedCallback,
}: Readonly<{
    data: AppDocumentSourceAbs | null | undefined;
    reload: () => void;
    index: number;
    filePath: string;
    className?: string;
    contextMenuItems?: ContextMenuItemType[];
    onDrop?: (event: any) => void;
    onClick?: () => void;
    renderChild: (data: AppDocumentSourceAbs) => any;
    isPointer?: boolean;
    onTrashed?: () => void;
    isDisabledColorNote?: boolean;
    userClassName?: string;
    isSelected: boolean;
    renamedCallback?: (newFileSource: FileSource) => void;
}>) {
    const [isRenaming, setIsRenaming] = useState(false);
    useFileSourceRefreshEvents(['select']);
    const applyClick = () => {
        FileSource.getInstance(filePath).fireSelectEvent();
        onClick?.();
    };
    const selfContextMenu = genContextMenu(filePath, setIsRenaming, reload);
    selfContextMenu.push(...genTrashContextMenu(filePath, onTrashed));

    const handleContextMenuOpening = (event: any) => {
        showAppContextMenu(event, selfContextMenu);
    };
    if (data === null) {
        return null;
    }
    if (data === undefined) {
        return <FileReadErrorComp onContextMenu={handleContextMenuOpening} />;
    }
    const moreClassName =
        `${isSelected ? 'active' : ''} ` + `${className ?? ''}`;
    const fileSource = FileSource.getInstance(filePath);
    return (
        <li
            className={
                `list-group-item m-1 ${moreClassName}` +
                ` ${userClassName ?? ''} ${isPointer ? 'pointer' : ''}`
            }
            style={{
                borderRadius: '0.25rem',
            }}
            onClick={applyClick}
            data-index={index + 1}
            title={filePath}
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [
                    ...(contextMenuItems ?? []),
                    ...genCommonMenu(filePath),
                    ...selfContextMenu,
                ]);
            }}
            onDragOver={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    event.currentTarget.classList.add(RECEIVING_DROP_CLASSNAME);
                }
            }}
            onDragLeave={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    event.currentTarget.classList.remove(
                        RECEIVING_DROP_CLASSNAME,
                    );
                }
            }}
            onDrop={(event) => {
                if (onDrop) {
                    event.currentTarget.classList.remove(
                        RECEIVING_DROP_CLASSNAME,
                    );
                    onDrop(event);
                }
            }}
        >
            {isRenaming ? (
                <LazyRenderRenamingComp
                    setIsRenaming={setIsRenaming}
                    filePath={filePath}
                    renamedCallback={renamedCallback}
                />
            ) : (
                <>
                    {renderChild(data)}
                    {!isDisabledColorNote && (
                        <div className="color-note-container">
                            <ItemColorNoteComp item={fileSource} />
                        </div>
                    )}
                </>
            )}
        </li>
    );
}
