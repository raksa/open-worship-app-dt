import EditingHistoryManager from '../editing-manager/EditingHistoryManager';
import { MimetypeNameType, createNewFileDetail } from '../server/fileHelpers';
import FileSource from './FileSource';
import { AnyObjectType, validateAppMeta } from './helpers';

const cache = new Map<string, AppDocumentSourceAbs>();
export abstract class AppDocumentSourceAbs {
    protected static mimetypeName: MimetypeNameType = 'other';
    filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    get fileSource() {
        return FileSource.getInstance(this.filePath);
    }

    static validate(json: AnyObjectType) {
        if (!validateAppMeta(json.metadata)) {
            throw new Error('Invalid data');
        }
    }

    static _getInstance<T extends AppDocumentSourceAbs>(
        filePath: string,
        createInstance: () => T,
    ) {
        if (!cache.has(filePath)) {
            const instance = createInstance();
            cache.set(filePath, instance as any);
        }
        return cache.get(filePath) as any as T;
    }

    static getInstance(_filePath: string) {
        throw new Error('getInstance must be implemented in derived class');
    }
}

export default abstract class AppEditableDocumentSourceAbs extends AppDocumentSourceAbs {
    get editingHistoryManager() {
        return EditingHistoryManager.getInstance(this.filePath);
    }

    abstract save(): Promise<boolean>;

    static async create(dir: string, name: string, extraData: AnyObjectType) {
        const data = JSON.stringify({
            metadata: {
                fileVersion: 1,
                app: 'OpenWorship',
                initDate: new Date().toJSON(),
            },
            ...extraData,
        });
        const filePath = await createNewFileDetail(
            dir,
            name,
            data,
            this.mimetypeName,
        );
        if (filePath !== null) {
            return FileSource.getInstance(filePath);
        }
        return null;
    }
}
