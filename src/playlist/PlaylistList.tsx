import './PlaylistList.scss';

import PlaylistFile from './PlaylistFile';
import FileListHandler from '../others/FileListHandler';
import Playlist from './Playlist';
import DirSource from '../helper/DirSource';

export default function PlaylistList() {
    const dirSource = DirSource.getInstance('playlist-list-selected-dir');
    return (
        <FileListHandler id={'playlist-list'} mimetype={'playlist'}
            dirSource={dirSource}
            onNewFile={async (name) => {
                if (await Playlist.create(dirSource.dirPath, name)) {
                    dirSource.fireReloadEvent();
                    return false;
                }
                return true;
            }}
            header={<span>Playlists</span>}
            body={(fileSources) => {
                return (
                    <>
                        {fileSources.map((fileSource, i) => {
                            return <PlaylistFile key={`${i}`} index={i}
                                fileSource={fileSource} />;
                        })}
                    </>
                );
            }} />
    );
}
