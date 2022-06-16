import { Fragment, useState } from 'react';
import {
    BiblePresentType,
} from '../full-text-present/fullTextPresentHelper';
import { useStateSettingBoolean } from '../helper/settingHelper';
import BibleItem from '../bible-list/BibleItem';
import SlideItemThumbPlaylist from './SlideItemThumbPlaylist';
import FileItemHandler from '../others/FileItemHandler';
import { Playlist, validatePlaylist } from '../helper/playlistHelper';
import FileSource from '../helper/FileSource';

export default function PlaylistItem({
    index, list, setList, fileSource,
}: {
    index: number,
    list: FileSource[] | null,
    setList: (newList: FileSource[] | null) => void,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Playlist | null | undefined>(null);
    const [isOpened, setIsOpened] = useStateSettingBoolean(`opened-${fileSource.filePath}`);
    return (
        <FileItemHandler
            index={index}
            list={list}
            setList={setList}
            data={data}
            setData={setData}
            fileSource={fileSource}
            className={'playlist-item'}
            validator={validatePlaylist}
            onClick={() => setIsOpened(!isOpened)}
            onDrop={async (event) => {
                if (data) {
                    const receivedData = event.dataTransfer.getData('text');
                    try {
                        JSON.parse(receivedData);
                        const bible = JSON.parse(receivedData);
                        delete bible.groupIndex;
                        data.content.items.push({
                            type: 'bible',
                            bible: bible as BiblePresentType,
                        });
                    } catch (error) {
                        data.content.items.push({
                            type: 'slide',
                            slideItemThumbPath: receivedData,
                        });
                    }
                    data.save().then(() => {
                        setList(null);
                    });
                }
            }}
            child={<div className='card pointer mt-1 ps-2'>
                <div className='card-header'
                    onClick={() => setIsOpened(!isOpened)}>
                    <i className={`bi ${isOpened ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                    {fileSource.name}
                </div>
                {isOpened && data && <div className='card-body d-flex flex-column'>
                    {data.content.items.map((item, i) => {
                        if (item.type === 'slide') {
                            const slidePath = item.slideItemThumbPath as string;
                            return <Fragment key={`${i}`}>
                                <SlideItemThumbPlaylist
                                    slideItemThumbPath={slidePath}
                                    width={200} />
                            </Fragment>;
                        }
                        return <Fragment key={`${i}`}>
                            <BibleItem key={`${i}`} index={i} groupIndex={0}
                                biblePresent={item.bible as BiblePresentType} />
                        </Fragment>;
                    })}
                </div>}
            </div>}
        />
    );
}
