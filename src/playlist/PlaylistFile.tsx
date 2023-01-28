import { Suspense, useCallback, useEffect, useState } from 'react';
import { useStateSettingBoolean } from '../helper/settingHelper';
import BibleItem from '../bible-list/BibleItem';
import PlaylistSlideItem from './PlaylistSlideItem';
import FileItemHandler from '../others/FileItemHandler';
import Playlist from './Playlist';
import FileSource from '../helper/FileSource';
import BibleItemRender from '../bible-list/BibleItemRender';
import PlaylistItem from './PlaylistItem';
import ItemSource from '../helper/ItemSource';

export default function PlaylistFile({
    index, fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const [data, setData] = useState<Playlist | null | undefined>(null);
    const settingName = `opened-${fileSource.filePath}`;
    const [isOpened, setIsOpened] = useStateSettingBoolean(settingName);
    const reloadCallback = useCallback(() => {
        setData(null);
    }, [setData]);
    const onClickCallback = useCallback(() => {
        setIsOpened(!isOpened);
    }, [isOpened]);
    const onDropCallback = useCallback(async (event: any) => {
        if (data) {
            const receivedData = event.dataTransfer.getData('text');
            if (data.addFromData(receivedData)) {
                data.save();
            }
        }
    }, [data]);
    const renderChildCallback = useCallback((playlist: ItemSource<any>) => {
        return (
            <PlaylistPreview
                isOpened={isOpened}
                setIsOpened={setIsOpened}
                playlist={playlist as Playlist} />
        );
    }, [isOpened]);
    useEffect(() => {
        if (data === null) {
            Playlist.readFileToData(fileSource).then(setData);
        }
    }, [data]);
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={reloadCallback}
            fileSource={fileSource}
            className={'playlist-file'}
            onClick={onClickCallback}
            onDrop={onDropCallback}
            renderChild={renderChildCallback}
        />
    );
}

function PlaylistPreview({
    isOpened,
    setIsOpened,
    playlist,
}: {
    isOpened: boolean,
    setIsOpened: (isOpened: boolean) => void,
    playlist: Playlist,
}) {
    return (
        <div className='card pointer mt-1 ps-2'>
            <div className='card-header'
                onClick={() => {
                    setIsOpened(!isOpened);
                }}>
                <i className={`bi ${isOpened ?
                    'bi-chevron-down' : 'bi-chevron-right'}`} />
                {playlist.fileSource.name}
            </div>
            {isOpened && playlist && <div
                className='card-body d-flex flex-column'>
                {playlist.items.map((playlistItem, i) => {
                    return (
                        <RenderPlaylistItem
                            key={playlistItem.fileSource.fileName}
                            index={i}
                            playlistItem={playlistItem} />
                    );
                })}
            </div>}
        </div>
    );
}

function RenderPlaylistItem({
    playlistItem, index,
}: {
    playlistItem: PlaylistItem,
    index: number,
}) {
    if (playlistItem.isSlide) {
        return (
            <PlaylistSlideItem
                playlistItem={playlistItem} />
        );
    } else if (playlistItem.isBibleItem) {
        playlistItem.getBibleItem();
        return (
            <Suspense fallback={<div>Loading ...</div>}>
                <PlaylistBibleItem key={index}
                    index={index}
                    playlistItem={playlistItem} />
            </Suspense>
        );
    } else if (playlistItem.isLyric) {
        return (
            <div>Not Supported Item Type</div>
        );
    }
    return null;
}

function PlaylistBibleItem({
    index, playlistItem,
}: {
    index: number
    playlistItem: PlaylistItem,
}) {
    const [bibleItem, setBibleItem] = useState<BibleItem | null>(null);
    useEffect(() => {
        playlistItem.getBibleItem().then((newBibleItem) => {
            setBibleItem(newBibleItem);
        });
    }, [bibleItem]);
    if (bibleItem === null) {
        return null;
    }
    return (
        <BibleItemRender index={index}
            bibleItem={bibleItem} />
    );
}
