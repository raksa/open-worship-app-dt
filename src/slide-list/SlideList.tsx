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
import SlideFilePdf from './SlideFilePdf';

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
    return (
        <FileListHandler id={'slide-list'}
            mimetype={'slide'}
            dirSource={dirSource}
            checkExtraFile={(fileSource) => {
                if (checkIsPdf(fileSource.extension)) {
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
            bodyHandler={(fileSources) => {
                return (<>
                    {fileSources.map((fileSource, i) => {
                        if (checkIsPdf(fileSource.extension)) {
                            return <SlideFilePdf key={`${i}`} index={i}
                                fileSource={fileSource} />;
                        }
                        return <SlideFile key={`${i}`} index={i}
                            fileSource={fileSource} />;
                    })}
                </>);
            }} />
    );
}
