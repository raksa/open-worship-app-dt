import './PlaylistList.scss';

import PlaylistFile from './PlaylistFile';
import FileListHandler from '../others/FileListHandler';
import Playlist from './Playlist';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';
import { useGenDS } from '../helper/dirSourceHelpers';

export default function PlaylistList() {
    const dirSource = useGenDS('playlist-list-selected-dir');
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
