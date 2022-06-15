import { Fragment, useState } from 'react';
import { PlaylistType, validatePlaylist } from '../helper/playlistHelper';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';
import { FileSource } from '../helper/fileHelper';
import { useStateSettingBoolean } from '../helper/settingHelper';
import BibleItem from '../bible-list/BibleItem';
import SlideItemThumbPlaylist from './SlideItemThumbPlaylist';
import { useReadFileToData } from '../helper/helpers';
import FileNotFound from '../others/FileNotFound';

export default function PlaylistItem({
    index, fileSource, onContextMenu,
}: {
    index: number,
    fileSource: FileSource,
    onContextMenu: (e: any) => void,
}) {
    const [isOpened, setIsOpened] = useStateSettingBoolean(`playlist-item-${fileSource.name}`);
    const [isReceivingChild, setIsReceivingChild] = useState(false);
    const data = useReadFileToData<PlaylistType>(fileSource, validatePlaylist);
    if (data === null) {
        return <FileNotFound onContextMenu={onContextMenu} />;
    }
    return (
        <div className={`playlist-item card pointer mt-1 ps-2 ${isReceivingChild ? 'receiving-child' : ''}`}
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
            onDrop={async (event) => {
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
                fileSource.saveData(data);
            }}>
            <div className='card-header' onClick={() => {
                setIsOpened(!isOpened);
            }}>
                {<i className={`bi ${isOpened ? 'bi-chevron-down' : 'bi-chevron-right'}`} />}
                {fileSource.name}
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
