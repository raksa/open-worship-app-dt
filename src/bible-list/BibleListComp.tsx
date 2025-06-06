import './BibleListComp.scss';

import FileListHandlerComp from '../others/FileListHandlerComp';
import Bible from './Bible';
import BibleFileComp from './BibleFileComp';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import { getSettingPrefix } from '../helper/settingHelpers';
import { defaultDataDirNames } from '../helper/constants';
import appProvider from '../server/appProvider';

export default function BibleListComp() {
    const dirSourceSettingName = Bible.getDirSourceSettingName();
    const dirSource = useGenDirSource(dirSourceSettingName);
    const handleBodyRendering = (filePaths: string[]) => {
        return filePaths.map((filePath, i) => {
            return (
                <BibleFileComp key={filePath} index={i} filePath={filePath} />
            );
        });
    };
    if (dirSource === null) {
        return null;
    }
    Bible.getDefault();
    const settingPrefix = getSettingPrefix();
    const defaultDataDirName = appProvider.isPageReader
        ? defaultDataDirNames.BIBLE_READ
        : defaultDataDirNames.BIBLE_PRESENT;
    return (
        <FileListHandlerComp
            className={`${settingPrefix}bible-list`}
            mimetypeName="bible"
            defaultFolderName={defaultDataDirName}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !(await Bible.create(dirPath, name));
            }}
            header={<span>Bibles</span>}
            bodyHandler={handleBodyRendering}
            userClassName="p-0"
        />
    );
}
