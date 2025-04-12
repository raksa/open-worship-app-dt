import { DroppedDataType } from '../helper/DragInf';
import FileSource from '../helper/FileSource';
import { fsCheckFileExist, fsWriteFile } from '../server/fileHelpers';

export type AttachBackgroundType = { [key: string]: DroppedDataType };

export default class AttachBackgroundManager {
    static genMetaDataFilePath(filePath: string) {
        return `${filePath}.bg.json`;
    }

    static async saveData(filePath: string, data: AttachBackgroundType) {
        const metaDataFilePath =
            AttachBackgroundManager.genMetaDataFilePath(filePath);
        await FileSource.getInstance(metaDataFilePath).saveFileData(
            JSON.stringify(data),
        );
        FileSource.getInstance(filePath).fireUpdateEvent();
    }

    public async getAttachedBackgrounds(
        filePath: string,
    ): Promise<AttachBackgroundType> {
        const metaDataFilePath =
            AttachBackgroundManager.genMetaDataFilePath(filePath);
        const fileSource = FileSource.getInstance(metaDataFilePath);
        if (!(await fsCheckFileExist(metaDataFilePath))) {
            await fsWriteFile(metaDataFilePath, JSON.stringify({}));
        }
        const data = await fileSource.readFileJsonData();
        if (data === null) {
            return {};
        }
        return data;
    }

    public async getAttachedBackground(
        filePath: string,
        id: string,
    ): Promise<DroppedDataType | null> {
        const data = await this.getAttachedBackgrounds(filePath);
        return data[id] ?? null;
    }

    public async attachDroppedBackground(
        droppedData: DroppedDataType,
        filePath: string,
        id: string,
    ) {
        const data = await this.getAttachedBackgrounds(filePath);
        data[id] = droppedData;
        await AttachBackgroundManager.saveData(filePath, data);
    }

    public async detachBackground(filePath: string, id: string) {
        const data = await this.getAttachedBackgrounds(filePath);
        delete data[id];
        await AttachBackgroundManager.saveData(filePath, data);
    }
}

export const attachBackgroundManager = new AttachBackgroundManager();
