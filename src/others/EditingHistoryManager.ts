import { useState } from 'react';

import { handleError } from '../helper/errorHelpers';
import EventHandler, { RegisteredEventType } from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    fsCheckDirExist, fsCreateDir, fsDeleteDir, fsDeleteFile,
    fsListFiles, fsMoveFile, fsReadFile, fsWriteFile, pathBasename, pathJoin,
} from '../server/fileHelpers';
import { unlocking } from '../server/appHelpers';

const CURRENT_FILE_SIGN = '-*';
class FileLineHandler {
    dirPath: string;

    constructor(filePath: string) {
        this.dirPath = `${filePath}.histories`;
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
        const fileName = fileNames.find((fileFullName) => {
            return fileFullName.endsWith(CURRENT_FILE_SIGN);
        });
        if (fileName) {
            return pathJoin(this.dirPath, fileName);
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

    async changeCurrent(fileFullPath: string) {
        return await unlocking(this.dirPath, async () => {
            const currentFilePath = await this.getCurrentFileFullPath();
            if (currentFilePath !== null) {
                const currentFileIndex = this.toFileIndex(currentFilePath);
                await fsMoveFile(
                    currentFilePath, this.toFileFullPath(currentFileIndex),
                );
            }
            const fileIndex = this.toFileIndex(fileFullPath);
            await fsMoveFile(
                fileFullPath, this.toCurrentFileFullPath(fileIndex),
            );
            return true;
        });
    }

    async appendHistory(text: string) {
        try {
            let currentFilePath = await this.getCurrentFileFullPath();
            let nextFileIndex = 0;
            if (currentFilePath === null) {
                await this.clearHistories();
            } else {
                const currentFileIndex = this.toFileIndex(
                    currentFilePath,
                );
                await this.clearNextHistories(currentFileIndex);
                nextFileIndex = currentFileIndex + 1;
            }
            await this.ensureHistoriesDir();
            currentFilePath = this.toFileFullPath(nextFileIndex);
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

    async undo() {
        const filePath = (
            await this.fileLineHandler.getPreviousFileFullPath()
        );
        if (filePath === null) {
            return false;
        }
        await this.fileLineHandler.changeCurrent(filePath);
        EditingHistoryManager.fireEvent(this.filePath);
        return true;
    }

    async redo() {
        const filePath = await this.fileLineHandler.getNextFileFullPath();
        if (filePath === null) {
            return false;
        }
        await this.fileLineHandler.changeCurrent(filePath);
        EditingHistoryManager.fireEvent(this.filePath);
        return true;
    }

    async addHistory(text: string) {
        await this.fileLineHandler.appendHistory(text);
        EditingHistoryManager.fireEvent(this.filePath);
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
            EditingHistoryManager.fireEvent(this.filePath);
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
    const [status, setStatus] = useState([false, false]);
    const update = async () => {
        const editingHistoryManager = new EditingHistoryManager(filePath);
        const canUndo = await editingHistoryManager.checkCanUndo();
        const canRedo = await editingHistoryManager.checkCanRedo();
        setStatus([canUndo, canRedo]);
    };
    useEditingHistoryEvent(filePath, update);
    useAppEffect(() => {
        update();
    }, [filePath]);
    return status;
}
