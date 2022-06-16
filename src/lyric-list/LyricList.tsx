import './LyricList.scss';

import { useState } from 'react';
import {
    useStateSettingString,
} from '../helper/settingHelper';
import {
    useLyricUpdating,
} from '../event/FullTextPresentEventListener';
import LyricItem from './LyricItem';
import FileListHandler from '../others/FileListHandler';
import { Lyric } from '../helper/lyricHelpers';
import FileSource from '../helper/FileSource';
import { copyToClipboard } from '../helper/appHelper';

const id = 'lyric-list';
export default function LyricList() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString(`${id}-selected-dir`, '');
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
                    const isSuccess = await Lyric.createNew(dir, name, {
                        items: [Lyric.toNewLyric(name)],
                    });
                    if (isSuccess) {
                        setList(null);
                        return false;
                    }
                }
                return true;
            }}
            header={<span>Lyrics</span>}
            body={<>
                {(list || []).map((fileSource, i) => {
                    return <LyricItem key={`${i}`}
                        index={i}
                        onClick={() => {
                            Lyric.readFileToData(fileSource).then((lyric) => {
                                if (lyric) {
                                    Lyric.presentLyric(lyric);
                                    setList(null);
                                }
                            });
                        }}
                        fileSource={fileSource}
                        list={list} setList={setList} />;
                })}
            </>} />
    );
}
