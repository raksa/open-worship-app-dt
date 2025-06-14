import './LyricListComp.scss';

import FileListHandlerComp from '../others/FileListHandlerComp';
import {
    getFileExtension,
    getMimetypeExtensions,
    mimetypePdf,
} from '../server/fileHelpers';
import FileSource from '../helper/FileSource';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../helper/constants';
import { checkIsMarkdown } from './lyricHelpers';
import Lyric from './Lyric';
import LyricFileComp from './LyricFileComp';

async function newFileHandling(dirPath: string, name: string) {
    return !(await Lyric.create(dirPath, name));
}
const handleBodyRendering = (filePaths: string[]) => {
    return filePaths.map((filePath, i) => {
        return <LyricFileComp key={filePath} index={i} filePath={filePath} />;
    });
};

function handleExtraFileChecking(filePath: string) {
    const fileSource = FileSource.getInstance(filePath);
    if (checkIsMarkdown(fileSource.extension)) {
        return true;
    }
    return false;
}

async function checkIsOnScreen(_filePaths: string[]) {
    //  TODO: implement this function
    return false;
}

export default function LyricListComp() {
    const dirSource = useGenDirSource(dirSourceSettingNames.LYRIC);
    if (dirSource === null) {
        return null;
    }
    dirSource.checkExtraFile = (fileFullName: string) => {
        if (checkIsMarkdown(getFileExtension(fileFullName))) {
            return {
                fileFullName: fileFullName,
                appMimetype: mimetypePdf,
            };
        }
        return null;
    };

    return (
        <FileListHandlerComp
            className="app-lyric-list"
            mimetypeName="lyric"
            defaultFolderName={defaultDataDirNames.LYRIC}
            dirSource={dirSource}
            checkExtraFile={handleExtraFileChecking}
            onNewFile={newFileHandling}
            header={<span>Lyrics</span>}
            bodyHandler={handleBodyRendering}
            checkIsOnScreen={checkIsOnScreen}
            fileSelectionOption={{
                windowTitle: 'Select lyric files',
                dirPath: dirSource.dirPath,
                extensions: Array.from(
                    new Set([
                        ...getMimetypeExtensions('lyric'),
                        ...getMimetypeExtensions('markdown'),
                    ]),
                ),
            }}
        />
    );
}
