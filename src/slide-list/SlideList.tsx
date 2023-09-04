import './SlideList.scss';

import FileListHandler from '../others/FileListHandler';
import SlideFile from './SlideFile';
import Slide from './Slide';
import {
    checkIsPdf,
    convertOfficeFile,
    pdfMimetype,
    supportOfficeFE,
} from './slideHelpers';
import { extractExtension } from '../server/fileHelper';
import { useCallback } from 'react';
import FileSource from '../helper/FileSource';
import { useGenDS } from '../helper/dirSourceHelpers';

export default function SlideList() {
    const dirSource = useGenDS('slide-list-selected-dir');
    if (dirSource !== null) {
        dirSource.checkExtraFile = (fileName: string) => {
            if (checkIsPdf(extractExtension(fileName))) {
                return {
                    fileName,
                    appMimetype: pdfMimetype,
                };
            }
            return null;
        };
    }
    const checkExtraFileCallback = useCallback((fileSource: FileSource) => {
        if (checkIsPdf(fileSource.extension)) {
            return true;
        }
        return false;
    }, [dirSource]);
    const takeDropFileCallback = useCallback((fileSource: FileSource) => {
        if (dirSource === null) {
            return false;
        }
        const ext = fileSource.extension.toLocaleLowerCase();
        if (supportOfficeFE.includes(ext)) {
            convertOfficeFile(fileSource, dirSource);
            return true;
        }
        return false;
    }, [dirSource]);
    const bodyHandlerCallback = useCallback((fileSources: FileSource[]) => {
        return fileSources.map((fileSource, i) => {
            return <SlideFile key={fileSource.fileName}
                index={i}
                fileSource={fileSource} />;
        });
    }, []);
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandler id={'slide-list'}
            mimetype={'slide'}
            dirSource={dirSource}
            checkExtraFile={checkExtraFileCallback}
            takeDroppedFile={takeDropFileCallback}
            onNewFile={async (dirPath: string, name: string) => {
                return !await Slide.create(dirPath, name);
            }}
            header={<span>Slides</span>}
            bodyHandler={bodyHandlerCallback} />
    );
}
