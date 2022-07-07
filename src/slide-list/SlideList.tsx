import './SlideList.scss';

import { useState } from 'react';
import FileListHandler from '../others/FileListHandler';
import SlideFile from './SlideFile';
import Slide from './Slide';
import DirSource from '../helper/DirSource';

export default function SlideList() {
    const [dirSource, setDirSource] = useState(DirSource.genDirSource('slide-list-selected-dir'));
    return (
        <FileListHandler id={'slide-list'} mimetype={'slide'}
            dirSource={dirSource}
            setDirSource={setDirSource}
            onNewFile={async (name) => {
                if (await Slide.create(dirSource.dirPath, name)) {
                    dirSource.fireReloadEvent();
                    return false;
                }
                return true;
            }}
            header={<span>Slides</span>}
            body={<>
                {(dirSource.fileSources || []).map((fileSource, i) => {
                    return <SlideFile key={`${i}`} index={i}
                        fileSource={fileSource} />;
                })}
            </>} />
    );
}
