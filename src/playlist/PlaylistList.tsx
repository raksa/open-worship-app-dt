import './PlaylistList.scss';

import PlaylistFile from './PlaylistFile';
import FileListHandler from '../others/FileListHandler';
import Playlist from './Playlist';
import DirSource from '../helper/DirSource';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';

export default function PlaylistList() {
    const dirSource = DirSource.getInstance('playlist-list-selected-dir');
    const onNewFileCallback = useCallback(async (name: string) => {
        if (await Playlist.create(dirSource.dirPath, name)) {
            dirSource.fireReloadEvent();
            return false;
        }
        return true;
    }, [dirSource]);
    const bodyHandlerCallback = useCallback((fileSources: FileSource[]) => {
        return (
            <>
                {fileSources.map((fileSource, i) => {
                    return <PlaylistFile key={fileSource.fileName}
                        index={i}
                        fileSource={fileSource} />;
                })}
            </>
        );
    }, []);
    return (
        <FileListHandler id={'playlist-list'} mimetype={'playlist'}
            dirSource={dirSource}
            onNewFile={onNewFileCallback}
            header={<span>Playlists</span>}
            bodyHandler={bodyHandlerCallback} />
    );
}
