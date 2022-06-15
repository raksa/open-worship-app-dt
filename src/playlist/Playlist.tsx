import './Playlist.scss';

import { useState } from 'react';
import { toastEventListener } from '../event/ToastEventListener';
import {
    copyToClipboard,
    isMac,
    openExplorer,
} from '../helper/appHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import fileHelpers, {
    FileSourceType,
} from '../helper/fileHelper';
import { useStateSettingString } from '../helper/settingHelper';
import { AskingNewName } from '../others/AskingNewName';
import PlaylistItem from './PlaylistItem';
import FileListHandler, { createNewItem } from '../others/FileListHandler';

const id = 'playlist';
export default function Playlist() {
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [playlists, setPlaylists] = useState<FileSourceType[] | null>(null);
    const [dir, setDir] = useStateSettingString(`${id}-selected-dir`, '');
    const openContextMenu = (data: FileSourceType) => {
        return (e: any) => {
            showAppContextMenu(e, [
                {
                    title: 'Copy Path to Clipboard ', onClick: () => {
                        copyToClipboard(data.filePath);
                    },
                },
                {
                    title: 'Delete', onClick: async () => {
                        try {
                            await fileHelpers.deleteFile(data.filePath);
                            setPlaylists(null);
                        } catch (error: any) {
                            toastEventListener.showSimpleToast({
                                title: 'Deleting Playlist',
                                message: error.message,
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
        };
    };
    const mapPlaylists = playlists || [];
    return (
        <FileListHandler id={id} mimetype={'playlist'}
            list={playlists}
            setList={() => setPlaylists}
            dir={dir}
            setDir={setDir}
            header={<>
                <span>Playlists</span>
                <button className="btn btn-sm btn-outline-info float-end" title="new playlist list"
                    onClick={() => setIsCreatingNew(true)}>
                    <i className="bi bi-file-earmark-plus" />
                </button>
            </>}
            body={<>
                <ul className="list-group">
                    {isCreatingNew && <AskingNewName
                        applyName={async (name) => {
                            setIsCreatingNew(false);
                            if (name !== null) {
                                const content = JSON.stringify({
                                    metadata: {
                                        fileVersion: 1,
                                        app: 'OpenWorship',
                                        initDate: (new Date()).toJSON(),
                                    },
                                });
                                const isSuccess = await createNewItem(dir, name, content);
                                if (isSuccess) {
                                    setIsCreatingNew(false);
                                    setPlaylists(null);
                                }
                            } else {
                                setIsCreatingNew(false);
                            }
                        }} />}
                </ul>
                {mapPlaylists.map((data, i) => {
                    return <PlaylistItem key={`${i}`} index={i}
                        fileData={data}
                        onContextMenu={openContextMenu(data)} />;
                })}
            </>} />
    );
}
