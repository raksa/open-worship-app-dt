import './PlaylistList.scss';

import { useCallback } from 'react';
import PlaylistFile from './PlaylistFile';
import FileListHandler from '../others/FileListHandler';
import Playlist from './Playlist';
import { useGenDS } from '../helper/dirSourceHelpers';

export default function PlaylistList() {
    const dirSource = useGenDS('playlist-list-selected-dir');
    const bodyHandlerCallback = useCallback((filePaths: string[]) => {
        return (
            <>
                {filePaths.map((filePath, i) => {
                    return <PlaylistFile key={filePath}
                        index={i}
                        filePath={filePath} />;
                })}
            </>
        );
    }, []);
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandler id={'playlist-list'} mimetype={'playlist'}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !await Playlist.create(dirPath, name);
            }}
            header={<span>Playlists</span>}
            bodyHandler={bodyHandlerCallback} />
    );
}
