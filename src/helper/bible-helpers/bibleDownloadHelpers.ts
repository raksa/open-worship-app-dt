import { handleError } from '../errorHelpers';
import { LocaleType } from '../../lang';
import { showSimpleToast } from '../../toast/toastHelpers';
import { get_api_url, get_api_key } from '../../_owa-crypto/owa_crypto';
import appProvider from '../../server/appProvider';
import {
    fsDeleteFile, fsListDirectories, fsCheckDirExist, pathBasename, getFileName,
} from '../../server/fileHelpers';
import { bibleDataReader, getBibleInfo } from './bibleInfoHelpers';
import { appApiFetch } from '../networkHelpers';
import { tarExtract } from '../../server/appHelpers';
import { DownloadOptionsType, writeStreamToFile } from './downloadHelpers';

export const BIBLE_DOWNLOAD_TOAST_TITLE = 'Bible Download';

export function httpsRequestBible(
    pathName: string,
    callback: (error: Error | null, response?: any) => void,
) {
    const hostname = get_api_url().split('//')[1];
    const request = appProvider.httpUtils.request({
        port: 443,
        path: pathName,
        method: 'GET',
        hostname,
        headers: {
            'x-api-key': get_api_key(),
        },
    }, (response) => {
        callback(null, response);
    });
    request.on('error', (event: Error) => {
        callback(event);
    });
    request.end();
}

export async function startDownloadBible({ bibleFileFullName, options }: {
    bibleFileFullName: string,
    options: DownloadOptionsType
}) {
    const filePath = await bibleDataReader.toBiblePath(bibleFileFullName);
    if (filePath === null) {
        return options.onDone(new Error('Invalid file path'));
    }
    httpsRequestBible(bibleFileFullName, (error, response) => {
        if (error) {
            return options.onDone(error);
        }
        writeStreamToFile(filePath, options, response);
    });
}


export type BibleMinimalInfoType = {
    locale: LocaleType,
    title: string,
    key: string,
    version: number,
    filePath?: string,
};

export async function downloadBible({
    bibleInfo, options,
}: {
    bibleInfo: BibleMinimalInfoType,
    options: DownloadOptionsType,
}) {
    if (bibleInfo.filePath === undefined) {
        return options.onDone(new Error('Invalid file path'));
    }
    try {
        const downloadPath = await bibleDataReader.getWritableBiblePath();
        if (downloadPath === null) {
            return options.onDone(new Error('Cannot create writable path'));
        }
        await startDownloadBible({
            bibleFileFullName: `/${encodeURI(bibleInfo.filePath)}`, options,
        });
    } catch (error: any) {
        options.onDone(error);
    }
}

export async function extractDownloadedBible(filePath: string) {
    let isExtracted = false;
    try {
        showSimpleToast(
            BIBLE_DOWNLOAD_TOAST_TITLE,
            `Start extracting bible from file "${filePath}"`,
        );
        const downloadPath = await bibleDataReader.getWritableBiblePath();
        await tarExtract(filePath, downloadPath);
        const fileFullName = pathBasename(filePath);
        const fileName = getFileName(fileFullName);
        isExtracted = await fsCheckDirExist(
            appProvider.pathUtils.join(downloadPath, fileName),
        );
    } catch (error: any) {
        handleError(error);
        showSimpleToast(BIBLE_DOWNLOAD_TOAST_TITLE, 'Fail to extract bible');
    } finally {
        showSimpleToast(BIBLE_DOWNLOAD_TOAST_TITLE, 'Bible extracted');
        fsDeleteFile(filePath).catch((error) => {
            handleError(error);
            showSimpleToast(
                BIBLE_DOWNLOAD_TOAST_TITLE, 'Fail to delete downloaded file',
            );
        });
    }
    return isExtracted;
}

export async function getOnlineBibleInfoList():
    Promise<BibleMinimalInfoType[] | null> {
    try {
        const content = await appApiFetch('info.json');
        const json = await content.json();
        if (typeof json.mapper !== 'object') {
            throw new Error('Cannot get bible list');
        }
        return Object.entries(json.mapper).map(([key, value]:
            [key: string, value: any]) => {
            return {
                locale: value.locale,
                title: value.title,
                key,
                version: value.version,
                filePath: value.filePath,
            };
        });
    } catch (error) {
        handleError(error);
    }
    return null;
}

export async function getDownloadedBibleInfoList() {
    const writableBiblePath = await bibleDataReader.getWritableBiblePath();
    if (writableBiblePath === null) {
        return null;
    }
    const directoryNames = await fsListDirectories(writableBiblePath);
    const promises = directoryNames.map(async (bibleKey) => {
        return getBibleInfo(bibleKey);
    });
    try {
        const infoList = await Promise.all(promises);
        return infoList.filter((info) => {
            return info !== null;
        }) as BibleMinimalInfoType[];
    } catch (error) {
        handleError(error);
    }
    return null;
}
