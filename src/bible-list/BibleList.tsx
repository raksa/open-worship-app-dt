import './BibleList.scss';

import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import DirSource from '../helper/DirSource';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';

export default function BibleList() {
    const onNewFileCallback = useCallback(async (name: string) => {
        if (await Bible.create(dirSource.dirPath, name)) {
            dirSource.fireReloadEvent();
            return false;
        }
        return true;
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
    const dirSource = DirSource.getInstance('bible-list-selected-dir');
    Bible.getDefault();
    return (
        <FileListHandler id={'bible-list'} mimetype={'bible'}
            dirSource={dirSource}
            onNewFile={onNewFileCallback}
            header={<span>Bibles</span>}
            bodyHandler={bodyHandlerCallback} />
    );
}
