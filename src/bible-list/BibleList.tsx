import './BibleList.scss';

import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import { useCallback } from 'react';
import {
    BIBLE_LIST_SELECTED_DIR,
} from '../helper/bible-helpers/bibleHelpers';
import { useGenDS } from '../helper/dirSourceHelpers';

export default function BibleList() {
    const dirSource = useGenDS(BIBLE_LIST_SELECTED_DIR);
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
    Bible.getDefault();
    return (
        <FileListHandler id={'bible-list'}
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
