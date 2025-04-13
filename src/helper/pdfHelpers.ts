import { electronSendAsync } from '../server/appHelpers';
import appProvider from '../server/appProvider';
import {
    fsCheckDirExist,
    fsCreateDir,
    fsDeleteDir,
    fsListFiles,
} from '../server/fileHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import FileSource from './FileSource';

function toPdfImagesPreviewDirPath(filePath: string) {
    const fileSource = FileSource.getInstance(filePath);
    return appProvider.pathUtils.resolve(
        fileSource.basePath,
        `${fileSource.fileFullName}-images`,
    );
}

export function removePdfImagesPreview(filePath: string) {
    const outDir = toPdfImagesPreviewDirPath(filePath);
    return fsDeleteDir(outDir);
}

type PdfItemViewInfoType = {
    src: string;
    pageNumber: number;
    width: number;
    height: number;
};

function genPdfImagePreviewInfo(filePath: string): PdfItemViewInfoType {
    const fileSource = FileSource.getInstance(filePath);
    const pageNumber = parseInt(fileSource.name.split('-')[1]);
    return { src: fileSource.src, pageNumber, width: 0, height: 0 };
}

function sortPdfImagePreviewInfo(items: PdfItemViewInfoType[]) {
    items.sort((a, b) => {
        if (a.pageNumber < b.pageNumber) {
            return -1;
        }
        if (a.pageNumber > b.pageNumber) {
            return 1;
        }
        return 0;
    });
    return items;
}

export async function genPdfImagesPreview(
    filePath: string,
    isForce = false,
): Promise<PdfItemViewInfoType[] | null> {
    const outDir = toPdfImagesPreviewDirPath(filePath);
    if (!isForce && (await fsCheckDirExist(outDir))) {
        let fileList = await fsListFiles(outDir);
        fileList = fileList
            .filter((fileFullName) => {
                return fileFullName.toLowerCase().endsWith('.png');
            })
            .map((fileFullName) => {
                return appProvider.pathUtils.resolve(outDir, fileFullName);
            });
        if (fileList.length > 0) {
            const pagesCount = await electronSendAsync<number>(
                'main:app:pdf-pages-count',
                { filePath },
            );
            if (fileList.length !== pagesCount) {
                return null;
            }
            return sortPdfImagePreviewInfo(
                fileList.map(genPdfImagePreviewInfo),
            );
        }
    }
    showSimpleToast(
        'Generating PDF preview images',
        'Please do not close the application during this process.',
    );
    await fsDeleteDir(outDir);
    await fsCreateDir(outDir);
    const previewData: {
        isSuccessful: boolean;
        message?: string;
        filePaths?: string[];
    } = await electronSendAsync('main:app:pdf-to-images', {
        filePath,
        outDir,
        isForce: true,
    });
    if (!previewData.isSuccessful || !previewData.filePaths) {
        return null;
    }
    const imageFileInfoList = previewData.filePaths.map(genPdfImagePreviewInfo);
    if (imageFileInfoList.some((imageFileInfo) => imageFileInfo === null)) {
        return null;
    }
    return sortPdfImagePreviewInfo(imageFileInfoList);
}
