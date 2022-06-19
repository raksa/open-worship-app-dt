import './PlaylistList.scss';

import { useState } from 'react';
import {
    useStateSettingString,
} from '../helper/settingHelper';
import PlaylistFile from './PlaylistFile';
import FileListHandler, {
    FileListType,
} from '../others/FileListHandler';
import Playlist from './Playlist';

const id = 'playlist-list';
export default function PlaylistList() {
    const [list, setList] = useState<FileListType>(null);
    const [dir, setDir] = useStateSettingString<string>(`${id}-selected-dir`, '');
    return (
        <FileListHandler id={id} mimetype={'playlist'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (await Playlist.create(dir, name)) {
                    setList(null);
                    return false;
                }
                return true;
            }}
            header={<span>Playlists</span>}
            body={<>
                {(list || []).map((data, i) => {
                    return <PlaylistFile key={`${i}`}
                        index={i}
                        fileSource={data}
                        list={list}
                        setList={setList} />;
                })}
            </>} />
    );
}
