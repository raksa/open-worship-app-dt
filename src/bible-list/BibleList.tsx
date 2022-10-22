import './BibleList.scss';

import FileListHandler from '../others/FileListHandler';
import Bible from './Bible';
import BibleFile from './BibleFile';
import DirSource from '../helper/DirSource';

export default function BibleList() {
    const dirSource = DirSource.getInstance('bible-list-selected-dir');
    Bible.getDefault();
    return (
        <FileListHandler id={'bible-list'} mimetype={'bible'}
            dirSource={dirSource}
            onNewFile={async (name) => {
                if (await Bible.create(dirSource.dirPath, name)) {
                    dirSource.fireReloadEvent();
                    return false;
                }
                return true;
            }}
            header={<span>Bibles</span>}
            bodyHandler={(fileSources) => {
                return (
                    <>
                        {fileSources.map((fileSource, i) => {
                            return <BibleFile key={`${i}`} index={i}
                                fileSource={fileSource} />;
                        })}
                    </>
                );
            }} />
    );
}
