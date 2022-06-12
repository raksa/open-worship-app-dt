import './Playlist.scss';

import { Fragment, useEffect, useState } from 'react';
import PathSelector from '../others/PathSelector';
import {
    extractSlideItemThumbSelected,
    getPlaylistDataByFilePath,
    savePlaylist,
} from '../helper/helpers';
import { toastEventListener } from '../event/ToastEventListener';
import {
    copyToClipboard,
    isMac,
    openExplorer,
} from '../helper/appHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { PlaylistType } from '../helper/playlistHelper';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';
import {
    FileSourceType,
    listFiles,
    getAppMimetype,
    createFile,
    deleteFile,
} from '../helper/fileHelper';
import {
    useStateSettingString,
    useStateSettingBoolean,
} from '../helper/settingHelper';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getSlideDataByFilePath, HTML2React } from '../helper/slideHelper';
import BibleItem from '../bible-list/BibleItem';
import { AskingNewName } from '../others/AskingNewName';
import { SlideItemThumbIFrame } from '../slide-presenting/SlideItemThumbIFrame';

export default function Playlist() {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [dir, setDir] = useStateSettingString('playlist-selected-dir', '');
    const [playlists, setPlaylists] = useState<FileSourceType[] | null>(null);
    useEffect(() => {
        if (playlists === null) {
            const newPlaylists = listFiles(dir, 'playlist');
            setPlaylists(newPlaylists === null ? [] : newPlaylists);
        }
    }, [playlists, dir]);
    const createNewPlaylist = (name: string) => {
        // TODO: verify file name before create
        const mimeTypes = getAppMimetype('playlist');
        const playlistName = `${name}${mimeTypes[0].extension[0]}`;
        if (createFile(JSON.stringify({
            metadata: {
                fileVersion: 1,
                app: 'OpenWorship',
                initDate: (new Date()).toJSON(),
            },
        }), dir, playlistName)) {
            setPlaylists(null);
        } else {
            toastEventListener.showSimpleToast({
                title: 'Creating Playlist',
                message: 'Unable to create playlist due to internal error',
            });
        }
        setIsCreatingNew(false);
    };
    const applyDir = (newDir: string) => {
        setDir(newDir);
        setPlaylists(null);
    };
    const mapPlaylists = playlists || [];
    return (
        <div id="playlist" className="card w-100 h-100">
            <div className="card-header">
                <span>Playlists</span>
                <button className="btn btn-sm btn-outline-info float-end" title="new playlist list"
                    onClick={() => setIsCreatingNew(true)}>
                    <i className="bi bi-file-earmark-plus" />
                </button>
            </div>
            <div className="card-body">
                <PathSelector
                    prefix='bg-playlist'
                    dirPath={dir}
                    onRefresh={() => setPlaylists(null)}
                    onChangeDirPath={applyDir}
                    onSelectDirPath={applyDir} />
                <ul className="list-group">
                    {isCreatingNew && <AskingNewName applyName={(name) => {
                        setIsCreatingNew(false);
                        if (name !== null) {
                            createNewPlaylist(name);
                        }
                    }} />}
                </ul>
                {mapPlaylists.map((data, i) => {
                    return <ListItem key={`${i}`} index={i}
                        fileData={data}
                        onContextMenu={(e) => {
                            showAppContextMenu(e, [
                                {
                                    title: 'Copy Path to Clipboard ', onClick: () => {
                                        copyToClipboard(data.filePath);
                                    },
                                },
                                {
                                    title: 'Delete', onClick: () => {
                                        if (deleteFile(data.filePath)) {
                                            setPlaylists(null);
                                        } else {
                                            toastEventListener.showSimpleToast({
                                                title: 'Deleting Playlist',
                                                message: 'Unable to delete playlist due to internal error',
                                            });
                                        }
                                    },
                                },
                                {
                                    title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                                    onClick: () => {
                                        openExplorer(data.filePath);
                                    },
                                },
                            ]);
                        }} />;
                })}
            </div>
        </div>
    );
}

type PlaylistItemProps = {
    index: number,
    fileData: FileSourceType,
    onContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
}
function ListItem({ index, fileData, onContextMenu,
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
function SlideItemThumbPlaylist({
    slideItemThumbPath, width,
}: {
    slideItemThumbPath: string, width: number,
}) {
    const { id, slideFilePath } = extractSlideItemThumbSelected(slideItemThumbPath);
    const slideData = getSlideDataByFilePath(slideFilePath);
    const item = slideData === null ? null : (slideData.items.find((newItem) => newItem.id === id) || null);
    if (item === null) {
        return (
            <div className='card' style={{ width }}>Not Found</div>
        );
    }
    return (
        <div className='card overflow-hidden'
            onClick={() => {
                slideListEventListenerGlobal.selectSlideItemThumb(item);
            }}>
            <SlideItemThumbIFrame id={id} width={width}
                html2React={HTML2React.parseHTML(item.html)} />
        </div>
    );
}