import './SlideList.scss';

import FileListHandlerComp from '../others/FileListHandlerComp';
import SlideFile from './SlideFile';
import Slide, { useSelectedSlideSetterContext } from './Slide';
import {
    checkIsPdf,
    convertOfficeFile,
    supportOfficeFileExtensions,
} from './slideHelpers';
import {
    getFileExtension,
    getFileFullName,
    getMimetypeExtensions,
    mimetypePdf,
} from '../server/fileHelpers';
import FileSource from '../helper/FileSource';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../helper/constants';
import { DroppedFileType } from '../others/droppingFileHelpers';

export default function SlideList() {
    const setSelectedSlide = useSelectedSlideSetterContext();
    const dirSource = useGenDirSource(dirSourceSettingNames.SLIDE);
    if (dirSource !== null) {
        Slide.getSelectedSlide().then((slide) => {
            if (slide === null) {
                setSelectedSlide(null);
            }
        });
        dirSource.checkExtraFile = (fileFullName: string) => {
            if (checkIsPdf(getFileExtension(fileFullName))) {
                return {
                    fileFullName: fileFullName,
                    appMimetype: mimetypePdf,
                };
            }
            return null;
        };
    }
    const handleExtraFileChecking = (filePath: string) => {
        const fileSource = FileSource.getInstance(filePath);
        if (checkIsPdf(fileSource.extension)) {
            return true;
        }
        return false;
    };
    const handleFileTaking = (file: DroppedFileType | string) => {
        if (dirSource === null) {
            return false;
        }
        const fileFullName = getFileFullName(file);
        const ext = getFileExtension(fileFullName).toLocaleLowerCase();
        if (supportOfficeFileExtensions.includes(ext)) {
            convertOfficeFile(file, dirSource);
            return true;
        }
        return false;
    };
    const handleBodyRendering = (filePaths: string[]) => {
        return filePaths.map((filePath, i) => {
            const fileSource = FileSource.getInstance(filePath);
            return (
                <SlideFile
                    key={fileSource.fileFullName}
                    index={i}
                    filePath={filePath}
                />
            );
        });
    };
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandlerComp
            id="slide-list"
            mimetypeName="slide"
            defaultFolderName={defaultDataDirNames.SLIDE}
            dirSource={dirSource}
            checkExtraFile={handleExtraFileChecking}
            takeDroppedFile={handleFileTaking}
            onNewFile={async (dirPath: string, name: string) => {
                return !(await Slide.create(dirPath, name));
            }}
            header={<span>Slides</span>}
            bodyHandler={handleBodyRendering}
            fileSelectionOption={{
                windowTitle: 'Select slide files',
                dirPath: dirSource.dirPath,
                extensions: [
                    ...getMimetypeExtensions('slide'),
                    ...getMimetypeExtensions('pdf'),
                    ...supportOfficeFileExtensions,
                ],
                takeSelectedFile: handleFileTaking,
            }}
        />
    );
}
