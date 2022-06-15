import './Playlist.scss';

import { useState } from 'react';
import { toastEventListener } from '../event/ToastEventListener';
import {
    copyToClipboard,
    isMac,
    openExplorer,
} from '../helper/appHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { useStateSettingString } from '../helper/settingHelper';
import PlaylistItem from './PlaylistItem';
import FileListHandler, { createNewItem } from '../others/FileListHandler';
import fileHelpers, { FileSource } from '../helper/fileHelper';

const id = 'playlist';
export default function Playlist() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString(`${id}-selected-dir`, '');
    const openItemContextMenu = (data: FileSource) => {
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
                            setList(null);
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
    return (
        <FileListHandler id={id} mimetype={'playlist'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
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
                        setList(null);
                        return false;
                    }
                }
                return true;
            }}
            header={<span>Playlists</span>}
            body={<>
                {(list || []).map((data, i) => {
                    return <PlaylistItem key={`${i}`} index={i}
                        fileSource={data}
                        onContextMenu={openItemContextMenu(data)} />;
                })}
            </>} />
    );
}
