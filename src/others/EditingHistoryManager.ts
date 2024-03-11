import { useState } from 'react';
import { appendFile, rename, unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import { handleError } from '../helper/errorHelpers';
import EventHandler, { RegisteredEventType } from '../event/EventHandler';
import { fsCheckFileExist } from '../server/fileHelper';
import { useAppEffect } from '../helper/debuggerHelpers';


class FileLineHandler {
    readonly CURRENT_VIEW = '|***->';
    historyFilePath: string;
    constructor(filePath: string) {
        this.historyFilePath = `${filePath}.swap`;
    }
    async *processLineByLine() {
        const isFileExist = await fsCheckFileExist(this.historyFilePath);
        if (!isFileExist) {
            return;
        }
        const fileStream = createReadStream(this.historyFilePath);
        const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in filePath as a single line break.
        let lineNumber = 1;
        for await (const line of rl) {
            lineNumber++;
            yield [lineNumber, line] as [number, string];
        }
    }
    async getLine(lineNumber: number) {
        for await (const [lineNumber1, line] of this.processLineByLine()) {
            if (lineNumber === lineNumber1) {
                return line;
            }
        }
        return null;
    }
    async remapLines(taken: (_: [number, string]) => (string | null)) {
        const tempFilePath = `${this.historyFilePath}.tmp`;
        for await (const foundLine of this.processLineByLine()) {
            const newLIne = taken(foundLine);
            if (newLIne !== null) {
                this.appendLine(newLIne);
            }
        }
        await unlink(this.historyFilePath);
        await rename(tempFilePath, this.historyFilePath);
    }
    removeLines(from: number, to: number = Infinity) {
        if (to < from) {
            to = from;
        }
        return this.remapLines(([lineNumber, line]) => {
            if (lineNumber < from || lineNumber > to) {
                return line;
            }
            return null;
        });
    }
    async replaceLine(lineNumber: number, newLine: string) {
        return this.remapLines(([lineNumber1, line]) => {
            return lineNumber === lineNumber1 ? newLine : line;
        });
    }
    async getLastLineNumber() {
        let lastLineNumber = 0;
        for await (const [lineNumber, _] of this.processLineByLine()) {
            lastLineNumber = lineNumber;
        }
        return lastLineNumber;
    }
    async appendLine(line: string) {
        try {
            await appendFile(this.historyFilePath, line);
            return await this.getLastLineNumber();
        } catch (error) {
            handleError(error);
        }
        return null;
    }
    async getCurrentViewLine() {
        for await (const [lineNumber, line] of this.processLineByLine()) {
            if (line.startsWith(this.CURRENT_VIEW)) {
                return [lineNumber, line] as [number, string];
            }
        }
        return null;
    }
    async setCurrentViewLine(lineNumber: number) {
        const currentView = await this.getCurrentViewLine();
        if (currentView !== null) {
            await this.replaceLine(
                currentView[0], currentView[1].split(this.CURRENT_VIEW)[1],
            );
        }
        const line = await this.getLine(lineNumber);
        if (line !== null) {
            await this.replaceLine(lineNumber, `${this.CURRENT_VIEW}${line}`);
        }
    }
    async appendCurrentViewLine(line: string) {
        const currentView = await this.getCurrentViewLine();
        if (currentView !== null) {
            await this.removeLines(currentView[0] + 1);
        }
        await this.appendLine(line);
        const lastLineNumber = await this.getLastLineNumber();
        await this.setCurrentViewLine(lastLineNumber);
    }
    removeHistoryFile() {
        return unlink(this.historyFilePath);
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
    static fireUpdate(filePath: string) {
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

    async checkIsChanged() {
        const currentView = await this.fileLineHandler.getCurrentViewLine();
        if (currentView === null) {
            return false;
        }
        return currentView[0] > 0;
    }
    async checkCanUndo() {
        const currentView = await this.fileLineHandler.getCurrentViewLine();
        if (currentView === null) {
            return false;
        }
        return currentView[0] > 1;
    }
    async checkCanRedo() {
        const currentView = await this.fileLineHandler.getCurrentViewLine();
        const lastLineNumber = await this.fileLineHandler.getLastLineNumber();
        if (currentView === null) {
            return false;
        }
        return currentView[0] === lastLineNumber;
    }
    async undo() {
        const canUndo = await this.checkCanUndo();
        if (!canUndo) {
            return false;
        }
        const currentView = await this.fileLineHandler.getCurrentViewLine();
        if (currentView === null) {
            return false;
        }
        await this.fileLineHandler.setCurrentViewLine(currentView[0] - 1);
        EditingHistoryManager.fireUpdate(this.filePath);
        return true;
    }
    async redo() {
        const canRedo = await this.checkCanRedo();
        if (!canRedo) {
            return false;
        }
        const currentView = await this.fileLineHandler.getCurrentViewLine();
        if (currentView === null) {
            return false;
        }
        await this.fileLineHandler.setCurrentViewLine(currentView[0] + 1);
        EditingHistoryManager.fireUpdate(this.filePath);
        return true;
    }
    async addHistory(line: string) {
        await this.fileLineHandler.appendCurrentViewLine(line);
        EditingHistoryManager.fireUpdate(this.filePath);
    }
    async getLastedHistory() {
        const currentView = await this.fileLineHandler.getCurrentViewLine();
        if (currentView === null) {
            return null;
        }
        return currentView[1];
    }
    async discard() {
        try {
            await this.fileLineHandler.removeHistoryFile();
            EditingHistoryManager.fireUpdate(this.filePath);
            return true;
        } catch (error) {
            handleError(error);
        }
        return false;
    }
}

export function useEditingHistoryStatus(filePath: string) {
    const [status, setStatus] = useState([false, false]);
    useAppEffect(() => {
        const update = async () => {
            const editingHistoryManager = new EditingHistoryManager(filePath);
            const canUndo = await editingHistoryManager.checkCanRedo();
            const canRedo = await editingHistoryManager.checkCanRedo();
            setStatus([canUndo, canRedo]);
        };
        const registeredEvents = EditingHistoryManager.registerEventListener(
            filePath, update,
        );
        return () => {
            EditingHistoryManager.unregisterEventListener(registeredEvents);
        };
    }, [filePath]);
    return status;
}
