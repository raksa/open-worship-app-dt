import { showAppConfirm } from '../../popup-widget/popupWidgetHelpers';
import { getDesktopPath } from '../../server/appHelpers';
import appProvider from '../../server/appProvider';
import { fsCheckDirExist, fsCreateDir } from '../../server/fileHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../../helper/constants';
import { useAppEffect } from '../../helper/debuggerHelpers';
import DirSource from '../../helper/DirSource';
import { handleError } from '../../helper/errorHelpers';
import { getSetting, setSetting } from '../../helper/settingHelpers';

export const SELECTED_PARENT_DIR_SETTING_NAME = 'selected-parent-dir';
export async function getSelectedParentDirectory() {
    const selectedParentDir = getSetting(SELECTED_PARENT_DIR_SETTING_NAME);
    if (!selectedParentDir || !(await fsCheckDirExist(selectedParentDir))) {
        return null;
    }
    return selectedParentDir;
}
export async function setSelectedParentDirectory(dirPath: string) {
    if (!(await fsCheckDirExist(dirPath))) {
        throw new Error(`Directory does not exist: ${dirPath}`);
    }
    setSetting(SELECTED_PARENT_DIR_SETTING_NAME, dirPath);
}

function getDefaultDataDir() {
    const desktopPath = getDesktopPath();
    const dirPath = appProvider.pathUtils.join(
        desktopPath,
        'open-worship-data',
    );
    return dirPath;
}

async function selectDefaultData() {
    const defaultDataDir = getDefaultDataDir();
    const isOk = await showAppConfirm(
        'Select Default Data Folder',
        `This will select "${defaultDataDir}"`,
    );
    if (!isOk) {
        return;
    }
    try {
        await fsCreateDir(defaultDataDir);
        for (const [k, v] of Object.entries(defaultDataDirNames)) {
            const settingName = (dirSourceSettingNames as any)[k];
            const dirPath = appProvider.pathUtils.join(defaultDataDir, v);
            await fsCreateDir(dirPath);
            const isSuccess = await fsCheckDirExist(dirPath);
            if (isSuccess) {
                setSetting(settingName, dirPath);
            } else {
                await showAppConfirm(
                    'Creating Default Folder',
                    `Fail to create folder "${dirPath}"`,
                );
            }
        }
        appProvider.reload();
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
        const isSomeSelected = Object.values(dirSourceSettingNames).some(
            (settingName) => {
                return !!getSetting(settingName);
            },
        );
        if (!isSomeSelected) {
            selectDefaultData();
        }
    }, []);
}

export async function selectDefaultDataDirName(
    dirSource: DirSource,
    dirName: string,
) {
    const defaultDataDir = getDefaultDataDir();
    const dirPath = appProvider.pathUtils.join(defaultDataDir, dirName);
    const isOk = await showAppConfirm(
        'Select Default Folder',
        `This will select "${dirPath}" (will create if not exist)`,
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
            'Creating Default Folder',
            `Fail to create folder "${dirPath}"`,
        );
        return;
    }
    dirSource.dirPath = dirPath;
}
