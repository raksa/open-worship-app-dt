import './LyricList.scss';

import LyricFile from './LyricFile';
import FileListHandler from '../others/FileListHandler';
import Lyric from './Lyric';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';
import { useGenDS } from '../helper/dirSourceHelpers';

export default function LyricList() {
    const dirSource = useGenDS('lyric-list-selected-dir');
    const bodyHandlerCallback = useCallback((fileSources: FileSource[]) => {
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
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandler id={'lyric-list'}
            mimetype={'lyric'}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !await Lyric.create(dirPath, name);
            }}
            header={<span>Lyrics</span>}
            bodyHandler={bodyHandlerCallback} />
    );
}
