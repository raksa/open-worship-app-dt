import { showAppConfirm } from '../../popup-widget/popupWidgetHelpers';
import appProvider from '../../server/appProvider';
import {
    fsCheckDirExist,
    fsCreateDir,
    getDesktopPath,
} from '../../server/fileHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../../helper/constants';
import { useAppEffectAsync } from '../../helper/debuggerHelpers';
import DirSource from '../../helper/DirSource';
import { handleError } from '../../helper/errorHelpers';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import { goToGeneralSetting } from '../SettingComp';
import { appLocalStorage } from './appLocalStorage';

export function getDefaultDataDir() {
    const desktopPath = getDesktopPath();
    const dirPath = appProvider.pathUtils.join(
        desktopPath,
        'open-worship-data',
    );
    return dirPath;
}

export async function selectPathForChildDir(newPath: string) {
    const isOk = await showAppConfirm(
        'Set according paths',
        `All child directories will be set under "${newPath}"?`,
    );
    if (!isOk) {
        return;
    }
    try {
        for (const [k, v] of Object.entries(defaultDataDirNames)) {
            const settingName = (dirSourceSettingNames as any)[k];
            const dirPath = appProvider.pathUtils.join(newPath, v);
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
            `Fail to create folder "${newPath}"`,
        );
        return;
    }
}

export function checkShouldSelectChildDir() {
    const isSomeSelected = Object.values(dirSourceSettingNames).some(
        (settingName) => {
            return !!getSetting(settingName);
        },
    );
    return !isSomeSelected;
}

export function useCheckSelectedDir() {
    useAppEffectAsync(async () => {
        if (
            !appProvider.isPageSetting &&
            !(await appLocalStorage.getSelectedParentDirectory())
        ) {
            const isOk = await showAppConfirm(
                '`No Parent Directory Selected',
                '`You will be redirected to the General Settings page to ' +
                    'select a parent directory.',
            );
            if (!isOk) {
                return;
            }
            goToGeneralSetting();
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
