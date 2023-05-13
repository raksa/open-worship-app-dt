import './BibleList.scss';

import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import DirSource from '../helper/DirSource';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';
import { BIBLE_LIST_SELECTED_DIR } from '../helper/bibleHelpers';

export default function BibleList() {
    const onNewFileCallback = useCallback(async (name: string) => {
        return !await Bible.create(dirSource.dirPath, name);
    }, []);
    const bodyHandlerCallback = useCallback((fileSources: FileSource[]) => {
        return (
            <>
                {fileSources.map((fileSource, i) => {
                    return <BibleFile key={fileSource.fileName}
                        index={i}
                        fileSource={fileSource} />;
                })}
            </>
        );
    }, []);
    const dirSource = DirSource.getInstance(BIBLE_LIST_SELECTED_DIR);
    Bible.getDefault();
    return (
        <FileListHandler id={'bible-list'}
            mimetype={'bible'}
            dirSource={dirSource}
            onNewFile={onNewFileCallback}
            header={<span>Bibles</span>}
            bodyHandler={bodyHandlerCallback}
            userClassName='p-0' />
    );
}
