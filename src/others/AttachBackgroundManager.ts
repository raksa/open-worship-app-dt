import { getBackgroundSelectedDirSource } from '../background/backgroundHelpers';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import FileSource from '../helper/FileSource';
import {
    fsCheckFileExist,
    fsDeleteFile,
    fsWriteFile,
    pathJoin,
} from '../server/fileHelpers';
import { unlocking } from '../server/unlockingHelpers';
import CacheManager from './CacheManager';

export type AttachBackgroundType = { [key: string]: DroppedDataType };

const cached = new CacheManager<AttachBackgroundType | null>(5);
export default class AttachBackgroundManager {
    static genMetaDataFilePath(filePath: string) {
        return `${filePath}.bg.json`;
    }

    async getDirSource(droppedData: DroppedDataType) {
        let imageOrVideoType: 'image' | 'video' | null = null;
        if (droppedData.type === DragTypeEnum.BACKGROUND_IMAGE) {
            imageOrVideoType = 'image';
        } else if (droppedData.type === DragTypeEnum.BACKGROUND_VIDEO) {
            imageOrVideoType = 'video';
        }
        const dirSource =
            imageOrVideoType !== null
                ? await getBackgroundSelectedDirSource(imageOrVideoType)
                : null;
        return dirSource;
    }

    async saveData(filePath: string, data: AttachBackgroundType) {
        const metaDataFilePath =
            AttachBackgroundManager.genMetaDataFilePath(filePath);
        const newData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                if (value.type !== DragTypeEnum.BACKGROUND_COLOR) {
                    const fileSource = value.item as FileSource;
                    value = {
                        ...value,
                        item: (value as any).isFileFullNameOnly
                            ? fileSource.fileFullName
                            : fileSource.filePath,
                    };
                }
                return [key, value];
            }),
        );
        await FileSource.getInstance(metaDataFilePath).writeFileData(
            JSON.stringify(newData),
        );
        FileSource.getInstance(metaDataFilePath).fireUpdateEvent();
    }

    public async readData(filePath: string): Promise<AttachBackgroundType> {
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
        const imageDirSource = await getBackgroundSelectedDirSource('image');
        const videoDirSource = await getBackgroundSelectedDirSource('video');
        const newData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                if (value.type !== DragTypeEnum.BACKGROUND_COLOR) {
                    let filePath = value.item as string;
                    if (value.isFileFullNameOnly) {
                        if (
                            value.type === DragTypeEnum.BACKGROUND_IMAGE &&
                            imageDirSource?.dirPath
                        ) {
                            filePath = pathJoin(
                                imageDirSource.dirPath,
                                filePath,
                            );
                        } else if (
                            value.type === DragTypeEnum.BACKGROUND_VIDEO &&
                            videoDirSource?.dirPath
                        ) {
                            filePath = pathJoin(
                                videoDirSource.dirPath,
                                filePath,
                            );
                        }
                    }
                    value = {
                        ...value,
                        item: FileSource.getInstance(filePath),
                    };
                }
                return [key, value];
            }),
        );
        return newData;
    }

    toKey(id?: string | number): string {
        if (typeof id === 'number') {
            return id.toString();
        }
        return id ?? 'self';
    }

    toLockingKey(filePath: string): string {
        return `attached-background-${filePath}`;
    }

    public async getAttachedBackground(
        filePath: string,
        id?: string | number,
    ): Promise<DroppedDataType | null> {
        return await unlocking(this.toLockingKey(filePath), async () => {
            const cachedData = await cached.get(filePath);
            const data = cachedData ?? (await this.readData(filePath));
            const attachedData = data[this.toKey(id)] ?? null;
            return attachedData;
        });
    }

    public async attachDroppedBackground(
        droppedData: DroppedDataType,
        filePath: string,
        id?: string | number,
    ) {
        await unlocking(this.toLockingKey(filePath), async () => {
            const data = await this.readData(filePath);
            if (droppedData.type !== DragTypeEnum.BACKGROUND_COLOR) {
                const fileSource = droppedData.item as FileSource;
                const dirSource = await this.getDirSource(droppedData);
                (droppedData as any).isFileFullNameOnly =
                    dirSource?.dirPath &&
                    dirSource?.checkIsSameDirPath(fileSource.basePath);
            }
            data[this.toKey(id)] = droppedData;
            await cached.set(filePath, data);
            await this.saveData(filePath, data);
        });
    }

    public async detachBackground(filePath: string, id?: string | number) {
        await unlocking(this.toLockingKey(filePath), async () => {
            const data = await this.readData(filePath);
            delete data[this.toKey(id)];
            await cached.set(filePath, data);
            await this.saveData(filePath, data);
        });
    }

    public async deleteMetaDataFile(filePath: string) {
        await unlocking(this.toLockingKey(filePath), async () => {
            const metaDataFilePath =
                AttachBackgroundManager.genMetaDataFilePath(filePath);
            await cached.set(filePath, null);
            await fsDeleteFile(metaDataFilePath);
            FileSource.getInstance(metaDataFilePath).fireUpdateEvent();
        });
    }
}

export const attachBackgroundManager = new AttachBackgroundManager();
