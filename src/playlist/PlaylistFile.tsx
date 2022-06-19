import { useState } from 'react';
import { useStateSettingBoolean } from '../helper/settingHelper';
import BibleItem from '../bible-list/BibleItem';
import PlaylistSlideItem from './PlaylistSlideItem';
import FileItemHandler from '../others/FileItemHandler';
import Playlist from './Playlist';
import FileSource from '../helper/FileSource';
import BibleItemRender from '../bible-list/BibleItemRender';

export default function PlaylistFile({
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
            mimetype={'playlist'}
            list={list}
            setList={setList}
            data={data}
            setData={setData}
            fileSource={fileSource}
            className={'playlist-file'}
            onClick={() => setIsOpened(!isOpened)}
            onDrop={async (event) => {
                if (data) {
                    const receivedData = event.dataTransfer.getData('text');
                    if (data.addFromData(receivedData)) {
                        await data.save();
                        setList(null);
                    }
                }
            }}
            child={<div className='card pointer mt-1 ps-2'>
                <div className='card-header'
                    onClick={() => setIsOpened(!isOpened)}>
                    <i className={`bi ${isOpened ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                    {fileSource.name}
                </div>
                {isOpened && data && <div className='card-body d-flex flex-column'>
                    {data.content.items.map((playlistItem, i) => {
                        if (playlistItem.isSlideItem) {
                            return (
                                <PlaylistSlideItem width={200}
                                    slideItemPath={playlistItem.item.toSelectedItemSetting()} />
                            );
                        } else if (playlistItem.isBibleItem) {
                            return (
                                <BibleItemRender key={`${i}`} index={i}
                                    bibleItem={playlistItem.item as BibleItem} />
                            );
                        } else if (playlistItem.isLyricItem) {
                            return (
                                <div>Not Supported Item Type</div>
                            );
                        }
                    })}
                </div>}
            </div>}
        />
    );
}
