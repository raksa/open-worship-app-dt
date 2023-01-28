import './LyricList.scss';

import LyricFile from './LyricFile';
import FileListHandler from '../others/FileListHandler';
import Lyric from './Lyric';
import DirSource from '../helper/DirSource';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';

export default function LyricList() {
    const dirSource = DirSource.getInstance('lyric-list-selected-dir');
    const onNewFileCallback = useCallback(async (name: string) => {
        if (await Lyric.create(dirSource.dirPath, name)) {
            dirSource.fireReloadEvent();
            return false;
        }
        return true;
    }, [dirSource]);
    const bodyHandlerCallback = useCallback((
        fileSources: FileSource[]) => {
        return (
            <>
                {fileSources.map((fileSource, i) => {
                    return <LyricFile key={fileSource.fileName}
                        index={i}
                        fileSource={fileSource} />;
                })}
            </>
        );
    }, []);
    return (
        <FileListHandler id={'lyric-list'}
            mimetype={'lyric'}
            dirSource={dirSource}
            onNewFile={onNewFileCallback}
            header={<span>Lyrics</span>}
            bodyHandler={bodyHandlerCallback} />
    );
}
