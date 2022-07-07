import './BibleList.scss';

import { useState } from 'react';
import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import DirSource from '../helper/DirSource';

export default function BibleList() {
    const [dirSource, setDirSource] = useState(DirSource.genDirSource('bible-list-selected-dir'));
    return (
        <FileListHandler id={'bible-list'} mimetype={'bible'}
            dirSource={dirSource}
            setDirSource={setDirSource}
            onNewFile={async (name) => {
                if (await Bible.create(dirSource.dirPath, name)) {
                    dirSource.fireReloadEvent();
                    return false;
                }
                return true;
            }}
            header={<span>Bibles</span>}
            body={<>
                {(dirSource.fileSources || []).map((fileSource, i) => {
                    return <BibleFile key={`${i}`} index={i}
                        fileSource={fileSource} />;
                })}
            </>} />
    );
}
