import './BibleList.scss';

import { useCallback } from 'react';

import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import { useGenDS } from '../helper/dirSourceHelpers';
import {
    checkIsWindowReadingMode, useWindowMode,
} from '../router/routeHelpers';
import { getSettingPrefix } from '../helper/settingHelper';
import {
    defaultDataDirNames, dirSourceSettingNames,
} from '../helper/constants';

export default function BibleList() {
    const windowMode = useWindowMode();
    const isReadingMode = checkIsWindowReadingMode(windowMode);
    const isReading = checkIsWindowReadingMode(windowMode);
    const dirSourceSettingName = (
        isReading ? dirSourceSettingNames.BIBLE_READ :
            dirSourceSettingNames.BIBLE_PRESENT
    );
    const defaultDataDirName = (
        isReading ? defaultDataDirNames.BIBLE_READ :
            defaultDataDirNames.BIBLE_PRESENT
    );
    const dirSource = useGenDS(dirSourceSettingName);
    const bodyHandlerCallback = useCallback((filePaths: string[]) => {
        return (
            <>
                {filePaths.map((filePath, i) => {
                    return <BibleFile key={filePath}
                        index={i}
                        filePath={filePath} />;
                })}
            </>
        );
    }, []);
    if (dirSource === null) {
        return null;
    }
    Bible.getDefault(windowMode);
    const settingPrefix = getSettingPrefix(windowMode);
    return (
        <FileListHandler id={`${settingPrefix}bible-list`}
            mimetype='bible'
            defaultFolderName={defaultDataDirName}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !await Bible.create(dirPath, name);
            }}
            header={<span>Bibles</span>}
            bodyHandler={bodyHandlerCallback}
            userClassName='p-0' />
    );
}
