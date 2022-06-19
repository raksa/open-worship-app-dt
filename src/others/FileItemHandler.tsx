import { useEffect, useState } from 'react';
import FileReadError from './FileReadError';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import { copyToClipboard, isMac, openExplorer } from '../helper/appHelper';
import FileSource from '../helper/FileSource';
import ItemSource from '../helper/ItemSource';
import { MimetypeNameType } from '../helper/fileHelper';
import Lyric from '../lyric-list/Lyric';
import Playlist from '../playlist/Playlist';
import Slide from '../slide-list/Slide';
import Bible from '../bible-list/Bible';
import { FileListType } from './FileListHandler';

export const genCommonMenu = (fileSource: FileSource) => {
    return [
        {
            title: 'Copy Path to Clipboard', onClick: () => {
                copyToClipboard(fileSource.filePath);
            },
        },
        {
            title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
            onClick: () => {
                openExplorer(fileSource.filePath);
            },
        },
    ];
};
export default function FileItemHandler({
    data, setData, index, fileSource, className,
    contextMenu, setList, onDrop, onClick,
    child, mimetype,
}: {
    data: ItemSource<any> | null | undefined,
    setData: (d: any | null | undefined) => void,
    index: number,
    list: FileListType,
    setList: (newList: FileListType) => void,
    fileSource: FileSource,
    className: string
    contextMenu?: ContextMenuItemType[],
    onDrop?: (e: any) => void,
    onClick?: () => void,
    child: any,
    mimetype: MimetypeNameType,
}) {
    const [isDropOver, setIsReceivingChild] = useState(false);
    useEffect(() => {
        switch (mimetype) {
            case 'lyric':
                Lyric.readFileToData(fileSource).then(setData);
                break;
            case 'playlist':
                Playlist.readFileToData(fileSource).then(setData);
                break;
            case 'slide':
                Slide.readFileToData(fileSource).then(setData);
                break;
            case 'bible':
                Bible.readFileToData(fileSource).then(setData);
                break;
            default:
                throw new Error('Unsupported mimetype');
        }
        const deleteEvent = fileSource.registerEventListener('select', () => {
            setData(null);
        });
        return () => {
            fileSource.unregisterEventListener(deleteEvent);
        };
    });
    const applyClick = () => {
        fileSource.select();
        onClick && onClick();
    };
    const onContextMenu = (e: any) => {
        showAppContextMenu(e, [
            ...(contextMenu || []),
            ...genCommonMenu(fileSource),
            {
                title: 'Delete', onClick: async () => {
                    await fileSource.delete();
                    setList(null);
                },
            },
        ]);
    };
    if (data === null) {
        return null;
    }
    if (data === undefined) {
        return <FileReadError onContextMenu={onContextMenu} />;
    }
    const droppingClass = isDropOver ? 'receiving-child' : '';
    return (
        <li className={`list-group-item mx-1 ${className} ${droppingClass}`}
            onClick={applyClick}
            data-index={index + 1}
            title={fileSource.filePath}
            onContextMenu={onContextMenu}
            onDragOver={(event) => {
                event.preventDefault();
                setIsReceivingChild(true);
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                setIsReceivingChild(false);
            }}
            onDrop={(event) => {
                setIsReceivingChild(false);
                onDrop && onDrop(event);
            }}>
            {child}
        </li>
    );
}
