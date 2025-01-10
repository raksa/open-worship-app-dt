import './LyricList.scss';

import LyricFile from './LyricFile';
import FileListHandlerComp from '../others/FileListHandlerComp';
import Lyric from './Lyric';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../helper/constants';

export default function LyricList() {
    const dirSource = useGenDirSource(dirSourceSettingNames.LYRIC);
    const handleBodyRendering = (filePaths: string[]) => {
        return (
            <>
                {filePaths.map((filePath, i) => {
                    return (
                        <LyricFile
                            key={filePath}
                            index={i}
                            filePath={filePath}
                        />
                    );
                })}
            </>
        );
    };
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandlerComp
            id="lyric-list"
            mimetypeName="lyric"
            defaultFolderName={defaultDataDirNames.LYRIC}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !(await Lyric.create(dirPath, name));
            }}
            header={<span>Lyrics</span>}
            bodyHandler={handleBodyRendering}
        />
    );
}
