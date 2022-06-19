import './LyricList.scss';

import { useState } from 'react';
import LyricFile from './LyricFile';
import FileListHandler from '../others/FileListHandler';
import Lyric from './Lyric';
import DirSource from '../helper/DirSource';

export default function LyricList() {
    const [dirSource, setDirSource] = useState(DirSource.genDirSource(''));
    return (
        <FileListHandler id={'lyric-list'} mimetype={'lyric'}
            dirSource={dirSource}
            setDirSource={setDirSource}
            onNewFile={async (name) => {
                if (await Lyric.create(dirSource.dirPath, name)) {
                    dirSource.clearFileSources();
                    return false;
                }
                return true;
            }}
            header={<span>Lyrics</span>}
            body={<>
                {(dirSource.fileSources || []).map((fileSource, i) => {
                    return <LyricFile key={`${i}`} index={i}
                        fileSource={fileSource} />;
                })}
            </>} />
    );
}
