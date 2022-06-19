import './PlaylistList.scss';

import { useState } from 'react';
import {
    useStateSettingString,
} from '../helper/settingHelper';
import PlaylistFile from './PlaylistFile';
import FileListHandler from '../others/FileListHandler';
import FileSource from '../helper/FileSource';
import Playlist from './Playlist';

const id = 'playlist-list';
export default function PlaylistList() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString<string>(`${id}-selected-dir`, '');
    return (
        <FileListHandler id={id} mimetype={'playlist'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (name !== null) {
                    if (await Playlist.createNew(dir, name)) {
                        setList(null);
                        return false;
                    }
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
