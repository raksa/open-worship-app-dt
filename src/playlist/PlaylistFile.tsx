import { useState } from 'react';

import { useStateSettingBoolean } from '../helper/settingHelpers';
import BibleItem from '../bible-list/BibleItem';
import PlaylistSlideItem from './PlaylistSlideItem';
import FileItemHandler from '../others/FileItemHandler';
import Playlist from './Playlist';
import BibleItemRender from '../bible-list/BibleItemRender';
import PlaylistItem from './PlaylistItem';
import ItemSource from '../helper/ItemSource';
import { useAppEffect } from '../helper/debuggerHelpers';
import FileSource from '../helper/FileSource';
import AppSuspense from '../others/AppSuspense';

export default function PlaylistFile({
    index, filePath,
}: Readonly<{
    index: number,
    filePath: string,
}>) {
    const [data, setData] = useState<Playlist | null | undefined>(null);
    const settingName = `opened-${filePath}`;
    const [isOpened, setIsOpened] = useStateSettingBoolean(settingName);
    const handleReloading = () => {
        setData(null);
    };
    const handleClicking = () => {
        setIsOpened(!isOpened);
    };
    const handleDropping = async (event: any) => {
        if (data) {
            const receivedData = event.dataTransfer.getData('text');
            if (data.addFromData(receivedData)) {
                data.save();
            }
        }
    };
    const handleChildRendering = (playlist: ItemSource<any>) => {
        return (
            <PlaylistPreview
                isOpened={isOpened}
                setIsOpened={setIsOpened}
                playlist={playlist as Playlist} />
        );
    };
    useAppEffect(() => {
        if (data === null) {
            Playlist.readFileToData(filePath).then(setData);
        }
    }, [data]);
    return (
        <FileItemHandler
            index={index}
            data={data}
            reload={handleReloading}
            filePath={filePath}
            className='playlist-file'
            onClick={handleClicking}
            onDrop={handleDropping}
            renderChild={handleChildRendering}
        />
    );
}

function PlaylistPreview({
    isOpened, setIsOpened, playlist,
}: Readonly<{
    isOpened: boolean,
    setIsOpened: (isOpened: boolean) => void,
    playlist: Playlist,
}>) {
    const fileSource = FileSource.getInstance(playlist.filePath);
    return (
        <div className='card pointer mt-1 ps-2'>
            <div className='card-header'
                onClick={() => {
                    setIsOpened(!isOpened);
                }}>
                <i className={`bi ${isOpened ?
                    'bi-chevron-down' : 'bi-chevron-right'}`} />
                {fileSource.name}
            </div>
            {isOpened && playlist && <div
                className='card-body d-flex flex-column'>
                {playlist.items.map((playlistItem, i) => {
                    return (
                        <RenderPlaylistItem
                            key={fileSource.fileFullName}
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
}: Readonly<{
    playlistItem: PlaylistItem,
    index: number,
}>) {
    if (playlistItem.isSlide) {
        return (
            <PlaylistSlideItem
                playlistItem={playlistItem} />
        );
    } else if (playlistItem.isBibleItem) {
        playlistItem.getBibleItem();
        return (
            <AppSuspense>
                <PlaylistBibleItem key={index}
                    index={index}
                    playlistItem={playlistItem} />
            </AppSuspense>
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
}: Readonly<{
    index: number
    playlistItem: PlaylistItem,
}>) {
    const [bibleItem, setBibleItem] = useState<BibleItem | null>(null);
    useAppEffect(() => {
        playlistItem.getBibleItem().then((newBibleItem) => {
            setBibleItem(newBibleItem);
        });
    }, [bibleItem]);
    if (bibleItem === null) {
        return null;
    }
    return (
        <BibleItemRender index={index}
            bibleItem={bibleItem}
        />
    );
}
