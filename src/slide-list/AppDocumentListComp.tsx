import './SlideList.scss';

import FileListHandlerComp from '../others/FileListHandlerComp';
import AppDocumentFileComp from './AppDocumentFileComp';
import AppDocument from './AppDocument';
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
import {
    checkIsPdf,
    convertOfficeFile,
    getSelectedVaryAppDocument,
    supportOfficeFileExtensions,
    useSelectedAppDocumentSetterContext,
} from './appDocumentHelpers';

export default function AppDocumentListComp() {
    const setSelectedAppDocument = useSelectedAppDocumentSetterContext();
    const dirSource = useGenDirSource(dirSourceSettingNames.SLIDE);
    if (dirSource !== null) {
        dirSource.checkExtraFile = (fileFullName: string) => {
            if (checkIsPdf(getFileExtension(fileFullName))) {
                return {
                    fileFullName: fileFullName,
                    appMimetype: mimetypePdf,
                };
            }
            return null;
        };
        setTimeout(async () => {
            const varAppDocument = await getSelectedVaryAppDocument();
            if (varAppDocument === null) {
                setSelectedAppDocument(null);
            }
        }, 1000);
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
                <AppDocumentFileComp
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
                return !(await AppDocument.create(dirPath, name));
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
