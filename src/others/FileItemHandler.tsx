import { useEffect, useState } from 'react';
import FileReadError from './FileReadError';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import { copyToClipboard, isMac, openExplorer } from '../helper/appHelper';
import FileSource from '../helper/FileSource';
import ItemSource from '../helper/ItemSource';

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
export default function FileItemHandler<T,>({
    data, setData, index, fileSource, className,
    contextMenu, validator, setList, onDrop, onClick,
    child,
}: {
    data: ItemSource<any> | null | undefined,
    setData: (d: ItemSource<any> | null | undefined) => void,
    index: number,
    list: FileSource[] | null,
    setList: (newList: FileSource[] | null) => void,
    fileSource: FileSource,
    className: string
    contextMenu?: ContextMenuItemType[],
    validator: (json: any) => boolean,
    onDrop?: (e: any) => void,
    onClick?: () => void,
    child: any,
}) {
    const [isDropOver, setIsReceivingChild] = useState(false);
    useEffect(() => {
        fileSource.readFileToData(validator).then(setData);
    }, [fileSource.filePath]);
    if (data === null) {
        return null;
    }
    const onContextMenu = (e: any) => {
        showAppContextMenu(e, [
            {
                title: 'Open', onClick: () => {
                    onClick && onClick();
                },
            },
            ...(contextMenu || []),
            ...genCommonMenu(fileSource),
            {
                title: 'Delete', onClick: async () => {
                    if (data) {
                        await data.delete();
                        setList(null);
                    }
                },
            },
        ]);
    };
    if (data === undefined) {
        return <FileReadError onContextMenu={onContextMenu} />;
    }
    const droppingClass = isDropOver ? 'receiving-child' : '';
    return (
        <li className={`list-group-item mx-1 ${className} ${droppingClass}`}
            onClick={() => onClick && onClick()}
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
