import './Playlist.scss';

import { useEffect, useState } from 'react';
import PathSelector from '../others/PathSelector';
import { toastEventListener } from '../event/ToastEventListener';
import {
    copyToClipboard,
    isMac,
    openExplorer,
} from '../helper/appHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    FileSourceType,
    listFiles,
    getAppMimetype,
    createFile,
    deleteFile,
} from '../helper/fileHelper';
import { useStateSettingString } from '../helper/settingHelper';
import { AskingNewName } from '../others/AskingNewName';
import PlaylistItem from './PlaylistItem';

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
                    return <PlaylistItem key={`${i}`} index={i}
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
