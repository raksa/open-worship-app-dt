import './SlideList.scss';

import { useCallback } from 'react';

import FileListHandler from '../others/FileListHandler';
import SlideFile from './SlideFile';
import Slide from './Slide';
import {
    checkIsPdf, convertOfficeFile, pdfMimetype, supportOfficeFE,
} from './slideHelpers';
import { extractExtension } from '../server/fileHelper';
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
    const checkExtraFileCallback = useCallback((filePath: string) => {
        const fileSource = FileSource.getInstance(filePath);
        if (checkIsPdf(fileSource.extension)) {
            return true;
        }
        return false;
    }, [dirSource]);
    const takeDropFileCallback = useCallback((filePath: string) => {
        if (dirSource === null) {
            return false;
        }
        const fileSource = FileSource.getInstance(filePath);
        const ext = fileSource.extension.toLocaleLowerCase();
        if (supportOfficeFE.includes(ext)) {
            convertOfficeFile(filePath, dirSource);
            return true;
        }
        return false;
    }, [dirSource]);
    const bodyHandlerCallback = useCallback((filePaths: string[]) => {
        return filePaths.map((filePath, i) => {
            const fileSource = FileSource.getInstance(filePath);
            return <SlideFile key={fileSource.fileName}
                index={i}
                filePath={filePath} />;
        });
    }, []);
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandler id='slide-list'
            mimetype='slide'
            defaultFolderName='slides'
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
