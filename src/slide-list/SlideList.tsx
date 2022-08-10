import './SlideList.scss';

import FileListHandler from '../others/FileListHandler';
import SlideFile from './SlideFile';
import Slide from './Slide';
import DirSource from '../helper/DirSource';

export default function SlideList() {
    const dirSource = DirSource.getInstance('slide-list-selected-dir');
    return (
        <FileListHandler id={'slide-list'} mimetype={'slide'}
            dirSource={dirSource}
            onNewFile={async (name) => {
                if (await Slide.create(dirSource.dirPath, name)) {
                    dirSource.fireReloadEvent();
                    return false;
                }
                return true;
            }}
            header={<span>Slides</span>}
            body={(fileSources) => {
                return (<>
                    {fileSources.map((fileSource, i) => {
                        return <SlideFile key={`${i}`} index={i}
                            fileSource={fileSource} />;
                    })}
                </>);
            }} />
    );
}
