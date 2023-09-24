import './BibleList.scss';

import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import { useCallback } from 'react';
import { useGenDS } from '../helper/dirSourceHelpers';
import { useWindowMode } from '../router/routeHelpers';
import { getSettingPrefix } from '../helper/settingHelper';

export default function BibleList() {
    const windowMode = useWindowMode();
    const dirSource = useGenDS(Bible.getSelectDirSettingName(windowMode));
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
            mimetype={'bible'}
            dirSource={dirSource}
            onNewFile={async (dirPath: string, name: string) => {
                return !await Bible.create(dirPath, name);
            }}
            header={<span>Bibles</span>}
            bodyHandler={bodyHandlerCallback}
            userClassName='p-0' />
    );
}
