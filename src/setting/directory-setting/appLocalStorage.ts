import { handleError } from '../../helper/errorHelpers';
import CacheManager from '../../others/CacheManager';
import {
    fsCheckDirExist,
    fsExistSync,
    fsMkDirSync,
    fsReadSync,
    fsUnlinkSync,
    fsWriteFileSync,
    getUserWritablePath,
    pathJoin,
} from '../../server/fileHelpers';

export const SELECTED_PARENT_DIR_SETTING_NAME = 'selected-parent-dir';

const FOLDER_NAME = 'local-storage';
const defaultStorageCacher = new CacheManager<string>(3);
class AppLocalStorage {
    get defaultStorage() {
        const cachedDefaultStorage = defaultStorageCacher.getSync(
            SELECTED_PARENT_DIR_SETTING_NAME,
        );
        if (cachedDefaultStorage !== null) {
            return cachedDefaultStorage;
        }
        let selectedParentDir = window.localStorage.getItem(
            SELECTED_PARENT_DIR_SETTING_NAME,
        );
        if (!selectedParentDir || !fsExistSync(selectedParentDir)) {
            window.localStorage.removeItem(SELECTED_PARENT_DIR_SETTING_NAME);
            selectedParentDir = getUserWritablePath();
        }
        defaultStorageCacher.setSync(
            SELECTED_PARENT_DIR_SETTING_NAME,
            selectedParentDir,
        );
        return selectedParentDir;
    }

    get localStorageDir() {
        const cachedLocalStorageDir = defaultStorageCacher.getSync(FOLDER_NAME);
        if (cachedLocalStorageDir !== null) {
            return cachedLocalStorageDir;
        }
        const defaultStorage = this.defaultStorage;
        const localStorageDir = pathJoin(defaultStorage, FOLDER_NAME);
        if (!fsExistSync(localStorageDir)) {
            fsMkDirSync(localStorageDir, true);
        }
        defaultStorageCacher.setSync(FOLDER_NAME, localStorageDir);
        return localStorageDir;
    }

    async getSelectedParentDirectory() {
        const selectedParentDir = window.localStorage.getItem(
            SELECTED_PARENT_DIR_SETTING_NAME,
        );
        if (!selectedParentDir || !(await fsCheckDirExist(selectedParentDir))) {
            return null;
        }
        return selectedParentDir;
    }
    async setSelectedParentDirectory(dirPath: string) {
        if (!(await fsCheckDirExist(dirPath))) {
            throw new Error(`Directory does not exist: ${dirPath}`);
        }
        defaultStorageCacher.setSync(SELECTED_PARENT_DIR_SETTING_NAME, dirPath);
        window.localStorage.setItem(SELECTED_PARENT_DIR_SETTING_NAME, dirPath);
    }

    toFullPath(key: string): string {
        return pathJoin(this.localStorageDir, key);
    }

    getItem(key: string): string | null {
        const fullPath = this.toFullPath(key);
        try {
            if (!fsExistSync(fullPath)) {
                return null;
            }
            return fsReadSync(fullPath);
        } catch (error) {
            handleError(error);
            return null;
        }
    }

    setItem(key: string, value: string): void {
        const fullPath = this.toFullPath(key);
        fsWriteFileSync(fullPath, value);
    }

    removeItem(key: string): void {
        const fullPath = this.toFullPath(key);
        try {
            fsUnlinkSync(fullPath);
        } catch (error) {
            handleError(error);
        }
    }

    clear(): void {
        const localStorageDir = this.localStorageDir;
        if (fsExistSync(localStorageDir)) {
            fsUnlinkSync(localStorageDir);
        }
    }
}

export const appLocalStorage = new AppLocalStorage();
