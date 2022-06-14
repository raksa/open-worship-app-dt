import { Fragment, useEffect, useState } from 'react';
import {
    getPlaylistDataByFilePath,
    savePlaylist,
} from '../helper/helpers';
import { PlaylistType } from '../helper/playlistHelper';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';
import { FileSourceType } from '../helper/fileHelper';
import { useStateSettingBoolean } from '../helper/settingHelper';
import BibleItem from '../bible-list/BibleItem';
import SlideItemThumbPlaylist from './SlideItemThumbPlaylist';

type PlaylistItemProps = {
    index: number,
    fileData: FileSourceType,
    onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
}
export default function PlaylistItem({
    index, fileData, onContextMenu,
}: PlaylistItemProps) {
    const playlistName = fileData.fileName.substring(0, fileData.fileName.lastIndexOf('.'));
    const [isOpened, setIsOpened] = useStateSettingBoolean(`playlist-item-${playlistName}`);
    const [isReceivingChild, setIsReceivingChild] = useState(false);
    const [data, setData] = useState<PlaylistType | null>(null);
    useEffect(() => {
        if (data === null) {
            const newData = getPlaylistDataByFilePath(fileData.filePath);
            setData(newData);
        }
    }, [data, fileData.filePath]);
    if (data === null) {
        return <div className='card pointer' onContextMenu={onContextMenu}>
            <div className='card-header'>not found</div>
        </div>;
    }
    return (
        <div className={`playlist-item card pointer mt-1 ps-2 ${isReceivingChild ? 'receiving-child' : ''}`}
            data-index={index + 1}
            title={fileData.filePath}
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
                const receivedData = event.dataTransfer.getData('text');
                try {
                    JSON.parse(receivedData);
                    const bible = JSON.parse(receivedData);
                    delete bible.groupIndex;
                    data.items.push({
                        type: 'bible',
                        bible: bible as BiblePresentType,
                    });
                } catch (error) {
                    data.items.push({
                        type: 'slide',
                        slideItemThumbPath: receivedData,
                    });
                }
                if (savePlaylist(fileData.filePath, data)) {
                    setData(null);
                }
            }}>
            <div className='card-header' onClick={() => {
                setIsOpened(!isOpened);
            }}>
                {<i className={`bi ${isOpened ? 'bi-chevron-down' : 'bi-chevron-right'}`} />}
                {playlistName}
            </div>
            {isOpened && <div className='card-body d-flex flex-column'>
                {data.items.map((item, i) => {
                    if (item.type === 'slide') {
                        return <Fragment key={`${i}`}>
                            <SlideItemThumbPlaylist
                                slideItemThumbPath={item.slideItemThumbPath as string}
                                width={200} />
                        </Fragment>;
                    }
                    return <Fragment key={`${i}`}>
                        <BibleItem key={`${i}`} index={i} groupIndex={0}
                            biblePresent={item.bible as BiblePresentType} />
                    </Fragment>;
                })}
            </div>}
        </div>
    );
}
