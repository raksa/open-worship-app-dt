import './LyricList.scss';

import LyricFile from './LyricFile';
import FileListHandler from '../others/FileListHandler';
import Lyric from './Lyric';
import DirSource from '../helper/DirSource';

export default function LyricList() {
    const dirSource = DirSource.getInstance('lyric-list-selected-dir');
    return (
        <FileListHandler id={'lyric-list'} mimetype={'lyric'}
            dirSource={dirSource}
            onNewFile={async (name) => {
                if (await Lyric.create(dirSource.dirPath, name)) {
                    dirSource.fireReloadEvent();
                    return false;
                }
                return true;
            }}
            header={<span>Lyrics</span>}
            bodyHandler={(fileSources) => {
                return (
                    <>
                        {fileSources.map((fileSource, i) => {
                            return <LyricFile key={`${i}`} index={i}
                                fileSource={fileSource} />;
                        })}
                    </>
                );
            }} />
    );
}
