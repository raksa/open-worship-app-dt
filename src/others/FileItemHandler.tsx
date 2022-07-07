import { useEffect, useState } from 'react';
import FileReadError from './FileReadError';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import {
    copyToClipboard, isMac, openExplorer,
} from '../helper/appHelper';
import FileSource from '../helper/FileSource';
import ItemSource from '../helper/ItemSource';
import { MimetypeNameType } from '../helper/fileHelper';
import Lyric from '../lyric-list/Lyric';
import Playlist from '../playlist/Playlist';
import Slide from '../slide-list/Slide';
import Bible from '../bible-list/Bible';

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
    contextMenu, onDrop, onClick,
    child, mimetype, isPointer,
}: {
    data: ItemSource<any> | null | undefined,
    setData: (d: any | null | undefined) => void,
    index: number,
    fileSource: FileSource,
    className?: string
    contextMenu?: ContextMenuItemType[],
    onDrop?: (e: any) => void,
    onClick?: () => void,
    child: any,
    mimetype: MimetypeNameType,
    isPointer?: boolean,
}) {
    const [isDropOver, setIsReceivingChild] = useState(false);
    useEffect(() => {
        if (data === null) {
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
        }
        const updateEvents = fileSource.registerEventListener(['update'], () => {
            setData(null);
        });
        return () => {
            fileSource.unregisterEventListener(updateEvents);
        };
    }, [data]);
    const applyClick = () => {
        fileSource.selectEvent();
        onClick && onClick();
    };
    const selfContextMenu = [
        {
            title: 'Reload', onClick: () => setData(null),
        }, {
            title: 'Delete', onClick: async () => {
                await fileSource.delete();
            },
        }];
    if (data === null) {
        return null;
    }
    if (data === undefined) {
        return <FileReadError onContextMenu={(e) => {
            showAppContextMenu(e, selfContextMenu);
        }} />;
    }
    const droppingClass = isDropOver ? 'receiving-child' : '';
    const moreClassName = `${data.isSelected ? 'active' : ''} ${className || ''} ${droppingClass}`;
    return (
        <li className={`list-group-item mx-1 ${moreClassName} ${isPointer ? 'pointer' : ''}`}
            onClick={applyClick}
            data-index={index + 1}
            title={fileSource.filePath}
            onContextMenu={(e) => {
                showAppContextMenu(e, [
                    ...(contextMenu || []),
                    ...genCommonMenu(fileSource),
                    ...selfContextMenu,
                ]);
            }}
            onDragOver={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    setIsReceivingChild(true);
                }
            }}
            onDragLeave={(event) => {
                if (onDrop) {
                    event.preventDefault();
                    setIsReceivingChild(false);
                }
            }}
            onDrop={(event) => {
                if (onDrop) {
                    setIsReceivingChild(false);
                    onDrop(event);
                }
            }}>
            {child}
        </li>
    );
}
