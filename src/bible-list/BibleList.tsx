import './BibleList.scss';

import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import { getSettingPrefix } from '../helper/settingHelpers';
import {
    defaultDataDirNames,
} from '../helper/constants';
import appProvider from '../server/appProvider';

export default function BibleList() {
    const dirSourceSettingName = Bible.getDirSourceSettingName();
    const dirSource = useGenDirSource(dirSourceSettingName);
    const handleBodyRendering = (filePaths: string[]) => {
        return (
            <>
                {filePaths.map((filePath, i) => {
                    return <BibleFile key={filePath}
                        index={i}
                        filePath={filePath} />;
                })}
            </>
        );
    };
    if (dirSource === null) {
        return null;
    }
    Bible.getDefault();
    const settingPrefix = getSettingPrefix();
    const defaultDataDirName = (
        appProvider.isPageReader ? defaultDataDirNames.BIBLE_READ :
            defaultDataDirNames.BIBLE_PRESENT
    );
    return (
        <FileListHandler id={`${settingPrefix}bible-list`}
            mimetype='bible'
            defaultFolderName={defaultDataDirName}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !await Bible.create(dirPath, name);
            }}
            header={<span>Bibles</span>}
            bodyHandler={handleBodyRendering}
            userClassName='p-0' />
    );
}
