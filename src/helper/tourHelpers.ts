import { openConfirm } from '../alert/alertHelpers';
import { getDesktopPath } from '../server/appHelper';
import appProvider from '../server/appProvider';
import { fsCreateDir } from '../server/fileHelper';
import { showSimpleToast } from '../toast/toastHelpers';
import { defaultDataDirNames, dirSourceSettingNames } from './constants';
import { useAppEffect } from './debuggerHelpers';
import DirSource from './DirSource';
import { handleError } from './errorHelpers';
import { getSetting, setSetting } from './settingHelper';

function getDefaultDataDir() {
    const desktopPath = getDesktopPath();
    const dirPath = appProvider.pathUtils.join(desktopPath, 'worship');
    return dirPath;
}

async function selectDefaultData() {
    const defaultDataDir = getDefaultDataDir();
    const isOk = await openConfirm(
        'Select Default Data Folder', `This will select "${defaultDataDir}"`,
    );
    if (!isOk) {
        return;
    }
    try {
        await fsCreateDir(defaultDataDir);
        const promises = Object.entries(defaultDataDirNames)
            .map<Promise<[string, string]>>(async ([k, v]) => {
                const settingName = (dirSourceSettingNames as any)[k];
                const dirPath = appProvider.pathUtils.join(defaultDataDir, v);
                await fsCreateDir(defaultDataDir);
                return [settingName, dirPath];
            });
        Promise.all(promises).then((pairs) => {
            for (const [settingName, dirPath] of pairs) {
                setSetting(settingName, dirPath);
            }
            appProvider.reload();
        });
    } catch (error: any) {
        if (!error.message.includes('file already exists')) {
            handleError(error);
        }
        showSimpleToast(
            'Creating Default Folder',
            `Fail to create folder "${defaultDataDir}"`,
        );
        return;
    }
}

export function useCheckSelectedDir() {
    useAppEffect(() => {
        const isSomeSelected = (
            Object.values(dirSourceSettingNames).some((settingName) => {
                return !!getSetting(settingName);
            })
        );
        if (!isSomeSelected) {
            selectDefaultData();
        }
    }, []);
}

export async function selectDefaultDataDirName(
    dirSource: DirSource, dirName: string,
) {
    const defaultDataDir = getDefaultDataDir();
    const dirPath = appProvider.pathUtils.join(defaultDataDir, dirName);
    const isOk = await openConfirm(
        'Select Default Folder', `This will select "${dirPath}"`,
    );
    if (!isOk) {
        return;
    }
    try {
        await fsCreateDir(dirPath);
    } catch (error: any) {
        if (!error.message.includes('file already exists')) {
            handleError(error);
        }
        showSimpleToast(
            'Creating Default Folder', `Fail to create folder "${dirPath}"`
        );
        return;
    }
    dirSource.dirPath = dirPath;
}
