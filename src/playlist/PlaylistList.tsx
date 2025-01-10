import './PlaylistList.scss';

import PlaylistFile from './PlaylistFile';
import FileListHandlerComp from '../others/FileListHandlerComp';
import Playlist from './Playlist';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../helper/constants';

export default function PlaylistList() {
    const dirSource = useGenDirSource(dirSourceSettingNames.PLAYLIST);
    const handleBodyRendering = (filePaths: string[]) => {
        return (
            <>
                {filePaths.map((filePath, i) => {
                    return (
                        <PlaylistFile
                            key={filePath}
                            index={i}
                            filePath={filePath}
                        />
                    );
                })}
            </>
        );
    };
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandlerComp
            id="playlist-list"
            mimetypeName="playlist"
            defaultFolderName={defaultDataDirNames.PLAYLIST}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !(await Playlist.create(dirPath, name));
            }}
            header={<span>Playlists</span>}
            bodyHandler={handleBodyRendering}
        />
    );
}
