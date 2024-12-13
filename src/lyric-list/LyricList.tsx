import './LyricList.scss';

import LyricFile from './LyricFile';
import FileListHandler from '../others/FileListHandler';
import Lyric from './Lyric';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import {
    defaultDataDirNames, dirSourceSettingNames,
} from '../helper/constants';

export default function LyricList() {
    const dirSource = useGenDirSource(dirSourceSettingNames.LYRIC);
    const handleBodyRendering = (filePaths: string[]) => {
        return (
            <>
                {filePaths.map((filePath, i) => {
                    return <LyricFile key={filePath}
                        index={i}
                        filePath={filePath} />;
                })}
            </>
        );
    };
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandler id='lyric-list'
            mimetype='lyric'
            defaultFolderName={defaultDataDirNames.LYRIC}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !await Lyric.create(dirPath, name);
            }}
            header={<span>Lyrics</span>}
            bodyHandler={handleBodyRendering} />
    );
}
