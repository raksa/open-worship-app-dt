import './LyricList.scss';

import { useState } from 'react';
import {
    useStateSettingString,
} from '../helper/settingHelper';
import {
    useLyricUpdating,
} from '../event/PreviewingEventListener';
import LyricFile from './LyricFile';
import FileListHandler from '../others/FileListHandler';
import FileSource from '../helper/FileSource';
import Lyric from './Lyric';

const id = 'lyric-list';
export default function LyricList() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString<string>(`${id}-selected-dir`, '');
    useLyricUpdating((newLyric) => {
        newLyric.save().then(() => {
            setList(null);
        });
    });
    return (
        <FileListHandler id={id} mimetype={'lyric'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            onNewFile={async (name) => {
                if (name !== null) {
                    if (await Lyric.createNew(dir, name)) {
                        setList(null);
                        return false;
                    }
                }
                return true;
            }}
            header={<span>Lyrics</span>}
            body={<>
                {(list || []).map((fileSource, i) => {
                    return <LyricFile key={`${i}`}
                        index={i}
                        fileSource={fileSource}
                        list={list} setList={setList} />;
                })}
            </>} />
    );
}
