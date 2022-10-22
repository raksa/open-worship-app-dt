import './SlideList.scss';

import FileListHandler from '../others/FileListHandler';
import SlideFile from './SlideFile';
import Slide from './Slide';
import DirSource from '../helper/DirSource';
import { convertOfficeFile, supportOfficeFE } from './slideHelpers';

export default function SlideList() {
    const dirSource = DirSource.getInstance('slide-list-selected-dir');
    return (
        <FileListHandler id={'slide-list'} mimetype={'slide'}
            dirSource={dirSource}
            isSupportedDroppedFile={(fileSource) => {
                if (fileSource.extension.toLocaleLowerCase() === '.pdf') {
                    return true;
                }
                return false;
            }}
            takeDroppedFile={(fileSource) => {
                const ext = fileSource.extension.toLocaleLowerCase();
                if (supportOfficeFE.includes(ext)) {
                    convertOfficeFile(fileSource, dirSource);
                    return true;
                }
                return false;
            }}
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
