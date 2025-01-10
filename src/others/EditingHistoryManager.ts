import { useState } from 'react';

import { handleError } from '../helper/errorHelpers';
import EventHandler, { RegisteredEventType } from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    fsCheckDirExist, fsCheckFileExist, fsCloneFile, fsCreateDir, fsDeleteDir,
    fsDeleteFile, fsListFiles, fsMoveFile, fsReadFile, fsWriteFile,
    pathBasename, pathJoin,
} from '../server/fileHelpers';
import { unlocking } from '../server/appHelpers';
import appProvider from '../server/appProvider';

const { diffUtils } = appProvider;

const CURRENT_FILE_SIGN = '-*';
class FileLineHandler {
    filePath: string;
    dirPath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.dirPath = `${this.filePath}.histories`;
    }

    private async getAllHistoryFiles() {
        if (!await fsCheckDirExist(this.dirPath)) {
            return [];
        }
        return await fsListFiles(this.dirPath);
    }

    private toFileIndex(fileFullPath: string) {
        const fileName = pathBasename(fileFullPath);
        const index = parseInt(fileName.split(CURRENT_FILE_SIGN)[0], 10);
        return index;
    }

    private toCurrentFileName(index: number) {
        return `${index}${CURRENT_FILE_SIGN}`;
    }

    private toCurrentFileFullPath(index: number) {
        return pathJoin(this.dirPath, this.toCurrentFileName(index));
    }

    private toFileFullPath(index: number) {
        return pathJoin(this.dirPath, index.toString());
    }

    async getCurrentFileFullPath() {
        const fileNames = await this.getAllHistoryFiles();
        const currentFiles = fileNames.filter((fileFullName) => {
            return fileFullName.endsWith(CURRENT_FILE_SIGN);
        });
        if (currentFiles.length === 1) {
            return pathJoin(this.dirPath, currentFiles[0]);
        }
        return null;
    }

    async getAllFileIndices() {
        const fileNames = await this.getAllHistoryFiles();
        return fileNames.map((fileFullName) => {
            return parseInt(fileFullName);
        }).filter((fileIndex) => {
            return !isNaN(fileIndex);
        });
    }

    private async getNeighborFileFullPath(isPrevious: boolean) {
        const currentFilePath = await this.getCurrentFileFullPath();
        if (currentFilePath === null) {
            return null;
        }
        const fileIndex = this.toFileIndex(currentFilePath);
        const fileIndices = await this.getAllFileIndices();
        const foundFileIndex = (
            isPrevious ? Math.max(
                ...fileIndices.filter((fileIndex1: number) => {
                    return fileIndex1 < fileIndex;
                })) : Math.min(...fileIndices.filter((fileIndex1: number) => {
                    return fileIndex1 > fileIndex;
                }))
        );
        if ([-Infinity, Infinity].includes(foundFileIndex)) {
            return null;
        }
        return this.toFileFullPath(foundFileIndex);
    }

    async getPreviousFileFullPath() {
        return this.getNeighborFileFullPath(true);
    }

    async getNextFileFullPath() {
        return this.getNeighborFileFullPath(false);
    }

    private async moveFile(fileFullPath: string, newFileFullPath: string) {
        await fsMoveFile(fileFullPath, newFileFullPath);
        return newFileFullPath;
    }

    async rollback(filePath: string) {
        const currentFilePath = await this.getCurrentFileFullPath();
        if (currentFilePath === null) {
            return false;
        }
        const currentContent = await fsReadFile(currentFilePath);
        const patchedText = await fsReadFile(filePath);
        const patcher = diffUtils.parsePatch(patchedText);
        const reversePatcher = diffUtils.reversePatch(patcher);
        const originalContent = diffUtils.applyPatch(
            currentContent, reversePatcher,
        );
        if (originalContent === false) {
            return false;
        }
        await fsWriteFile(filePath, originalContent);
        return true;
    }

    async changeCurrent(fileFullPath: string) {
        return await unlocking(this.dirPath, async () => {
            let lastFilePath = await this.getCurrentFileFullPath();
            if (lastFilePath !== null) {
                const lastFileIndex = this.toFileIndex(lastFilePath);
                lastFilePath = await this.moveFile(
                    lastFilePath, this.toFileFullPath(lastFileIndex),
                );
            }
            const fileIndex = this.toFileIndex(fileFullPath);
            const currentFilePath = await this.moveFile(
                fileFullPath, this.toCurrentFileFullPath(fileIndex),
            );
            if (lastFilePath !== null) {
                const lastContent = await fsReadFile(lastFilePath);
                const currentContent = await fsReadFile(currentFilePath);
                const patchedText = diffUtils.createPatch(
                    this.filePath, lastContent, currentContent,
                );
                await fsWriteFile(lastFilePath, patchedText);
            }
            return true;
        });
    }

    async appendHistory(text: string) {
        try {
            let currentFilePath = await this.getCurrentFileFullPath();
            if (currentFilePath === null) {
                return false;
            }
            const currentFileIndex = this.toFileIndex(currentFilePath);
            await this.clearNextHistories(currentFileIndex);
            currentFilePath = this.toFileFullPath(currentFileIndex + 1);
            await fsWriteFile(currentFilePath, text);
            await this.changeCurrent(currentFilePath);
            return true;
        } catch (error) {
            handleError(error);
        }
        return false;
    }

    async ensureHistoriesDir() {
        if (!await fsCheckDirExist(this.dirPath)) {
            await fsCreateDir(this.dirPath);
        }
        const fileNames = await fsListFiles(this.dirPath);
        if (fileNames.length === 0) {
            if (!await fsCheckFileExist(this.filePath)) {
                throw new Error(`File ${this.filePath} does not exist`);
            }
            const currentFilePath = this.toCurrentFileFullPath(0);
            await fsCloneFile(this.filePath, currentFilePath);
        }
    }

    clearHistories() {
        return fsDeleteDir(this.dirPath);
    }

    async clearNextHistories(index: number) {
        const fileIndices = await this.getAllFileIndices();
        const promises = fileIndices.filter((fileIndex) => {
            return fileIndex > index;
        }).map((fileIndex) => {
            return fsDeleteFile(this.toFileFullPath(fileIndex));
        });
        await Promise.all(promises);
    }

}

export type EditingHistoryEventType = 'update';
export default class EditingHistoryManager {
    private static readonly _eventPrefix = 'editing';
    public static readonly eventHandler = new EventHandler<any>();
    filePath: string;
    fileLineHandler: FileLineHandler;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.fileLineHandler = new FileLineHandler(this.filePath);
    }

    private static toEventKey(filePath: string) {
        return `${this._eventPrefix}:${filePath}`;

    }

    fireEvent() {
        EditingHistoryManager.fireEvent(this.filePath);
    }

    static fireEvent(filePath: string) {
        this.eventHandler.addPropEvent(this.toEventKey(filePath));
    }

    static registerEventListener(
        filePath: string, listener: () => Promise<void>,
    ) {
        const eventKey = this.toEventKey(filePath);
        return this.eventHandler.registerEventListener([eventKey], listener);
    }

    static unregisterEventListener(
        registeredEvents: RegisteredEventType<any, any>[],
    ) {
        this.eventHandler.unregisterEventListener(registeredEvents);
    }

    async checkCanUndo() {
        const previousFilePath = (
            await this.fileLineHandler.getPreviousFileFullPath()
        );
        return previousFilePath !== null;
    }

    async checkCanRedo() {
        const nextFilePath = await this.fileLineHandler.getNextFileFullPath();
        return nextFilePath !== null;
    }

    private async moveHistory(filePath: string | null) {
        if (filePath === null) {
            return false;
        }
        const isRollbackSuccess = await this.fileLineHandler.rollback(filePath);
        if (!isRollbackSuccess) {
            return false;
        }
        await this.fileLineHandler.changeCurrent(filePath);
        this.fireEvent();
        return true;
    }

    async undo() {
        const filePath = (
            await this.fileLineHandler.getPreviousFileFullPath()
        );
        return await this.moveHistory(filePath);
    }

    async redo() {
        const filePath = await this.fileLineHandler.getNextFileFullPath();
        return await this.moveHistory(filePath);
    }

    async addHistory(text: string) {
        await this.fileLineHandler.ensureHistoriesDir();
        await this.fileLineHandler.appendHistory(text);
        this.fireEvent();
    }

    async getCurrentHistory() {
        const currentFilePath = (
            await this.fileLineHandler.getCurrentFileFullPath()
        );
        if (currentFilePath === null) {
            return null;
        }
        return await fsReadFile(currentFilePath);
    }

    async discard() {
        try {
            await this.fileLineHandler.clearHistories();
            this.fireEvent();
            return true;
        } catch (error) {
            handleError(error);
        }
        return false;
    }

}

export function useEditingHistoryEvent(
    filePath: string, listener: () => Promise<void>,
) {
    useAppEffect(() => {
        const registeredEvents = EditingHistoryManager.registerEventListener(
            filePath, listener,
        );
        return () => {
            EditingHistoryManager.unregisterEventListener(registeredEvents);
        };
    }, [filePath, listener]);
}

export function useEditingHistoryStatus(filePath: string) {
    const [status, setStatus] = useState({
        canUndo: false,
        canRedo: false,
        canSave: false,
    });
    const update = async () => {
        const editingHistoryManager = new EditingHistoryManager(filePath);
        const canUndo = await editingHistoryManager.checkCanUndo();
        const canRedo = await editingHistoryManager.checkCanRedo();
        const historyText = await editingHistoryManager.getCurrentHistory();
        const text = await fsReadFile(filePath);
        const canSave = historyText !== null && historyText !== text;
        setStatus({ canUndo, canRedo, canSave });
    };
    useEditingHistoryEvent(filePath, update);
    useAppEffect(() => {
        update();
    }, [filePath]);
    return status;
}
