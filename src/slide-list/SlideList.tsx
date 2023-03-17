import './SlideList.scss';

import FileListHandler from '../others/FileListHandler';
import SlideFile from './SlideFile';
import Slide from './Slide';
import DirSource from '../helper/DirSource';
import {
    checkIsPdf,
    convertOfficeFile,
    pdfMimetype,
    supportOfficeFE,
} from './slideHelpers';
import { extractExtension } from '../server/fileHelper';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';

export default function SlideList() {
    const dirSource = DirSource.getInstance('slide-list-selected-dir');
    dirSource.checkExtraFile = (fileName: string) => {
        if (checkIsPdf(extractExtension(fileName))) {
            return {
                fileName,
                appMimetype: pdfMimetype,
            };
        }
        return null;
    };
    const checkExtraFileCallback = useCallback((fileSource: FileSource) => {
        if (checkIsPdf(fileSource.extension)) {
            return true;
        }
        return false;
    }, []);
    const takeDropFileCallback = useCallback((fileSource: FileSource) => {
        const ext = fileSource.extension.toLocaleLowerCase();
        if (supportOfficeFE.includes(ext)) {
            convertOfficeFile(fileSource, dirSource);
            return true;
        }
        return false;
    }, [dirSource]);
    const onNewFileCallback = useCallback(async (name: string) => {
        return !await Slide.create(dirSource.dirPath, name);
    }, [dirSource]);
    const bodyHandlerCallback = useCallback((fileSources: FileSource[]) => {
        return fileSources.map((fileSource, i) => {
            return <SlideFile key={fileSource.fileName}
                index={i}
                fileSource={fileSource} />;
        });
    }, []);
    return (
        <FileListHandler id={'slide-list'}
            mimetype={'slide'}
            dirSource={dirSource}
            checkExtraFile={checkExtraFileCallback}
            takeDroppedFile={takeDropFileCallback}
            onNewFile={onNewFileCallback}
            header={<span>Slides</span>}
            bodyHandler={bodyHandlerCallback} />
    );
}
