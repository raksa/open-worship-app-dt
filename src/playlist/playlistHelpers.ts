import fileHelpers from '../helper/fileHelper';
import { PlaylistType, validatePlaylist } from '../helper/playlistHelper';

export async function savePlaylist(playlistFilePath: string, playlist: PlaylistType) {
    await fileHelpers.deleteFile(playlistFilePath);
    return fileHelpers.createFile(JSON.stringify(playlist), playlistFilePath);
}
export async function getPlaylistDataByFilePath(filePath: string) {
    const str = await fileHelpers.readFile(filePath);
    if (str !== null) {
        const json = JSON.parse(str);
        if (validatePlaylist(json)) {
            return json as PlaylistType;
        }
    }
    return null;
}
