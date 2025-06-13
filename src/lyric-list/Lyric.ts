import { MimetypeNameType } from '../server/fileHelpers';
import { AnyObjectType } from '../helper/helpers';
import AppDocumentSourceAbs from '../helper/AppEditableDocumentSourceAbs';
import { OptionalPromise } from '../others/otherHelpers';
import EditingHistoryManager from '../editing-manager/EditingHistoryManager';
import FileSource from '../helper/FileSource';

const DEFAULT_CONTENT = `
<!-- title:start -->
# Lyric Title
<!-- title:end -->
<!-- verse:start -->
# Lyric Content
<!-- verse:end -->
<!-- chorus:start -->
# Lyric Chorus
<!-- chorus:end -->
<!-- bridge:start -->
# Lyric Bridge
<!-- bridge:end -->
<!-- outro:start -->
# Lyric Outro
<!-- outro:end -->
`;

export default class Lyric extends AppDocumentSourceAbs {
    static readonly mimetypeName: MimetypeNameType = 'lyric';

    constructor(filePath: string) {
        super(filePath);
    }

    get editingHistoryManager() {
        return EditingHistoryManager.getInstance(this.filePath);
    }

    getMetadata(): OptionalPromise<AnyObjectType> {
        throw new Error('Method not implemented.');
    }
    setMetadata(_metaData: AnyObjectType): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }

    async getContent() {
        const fileSource = FileSource.getInstance(this.filePath);
        const value = await fileSource.readFileData();
        if (value === null) {
            return null;
        }
        const data = JSON.parse(value);
        return data.content ?? '';
    }

    async setContent(content: string) {
        const fileSource = FileSource.getInstance(this.filePath);
        const value = await fileSource.readFileData();
        if (value === null) {
            return null;
        }
        const data = JSON.parse(value);
        data.content = content;
        return await fileSource.saveFileData(JSON.stringify(data));
    }

    static async create(dir: string, name: string) {
        return super.create(dir, name, { content: DEFAULT_CONTENT });
    }

    async save(): Promise<boolean> {
        return await this.editingHistoryManager.save((dataText) => {
            return dataText;
        });
    }

    static getInstance(filePath: string) {
        return this._getInstance(filePath, () => {
            return new this(filePath);
        });
    }
}
