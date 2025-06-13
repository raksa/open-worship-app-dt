import { MimetypeNameType } from '../server/fileHelpers';
import { AnyObjectType } from '../helper/helpers';
import AppDocumentSourceAbs, {
    AppDocumentMetadataType,
} from '../helper/AppEditableDocumentSourceAbs';

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

type LyricType = {
    metadata: AppDocumentMetadataType;
    content: string;
};

export default class Lyric extends AppDocumentSourceAbs<LyricType> {
    static readonly mimetypeName: MimetypeNameType = 'lyric';

    static validate(json: AnyObjectType): void {
        super.validate(json);
        if (typeof json.content !== 'string') {
            throw new Error(`Invalid lyric data json:${JSON.stringify(json)}`);
        }
    }

    async getContent() {
        const jsonData = await this.getJsonData();
        return jsonData?.content ?? '';
    }

    async setContent(content: string) {
        const jsonData = await this.getJsonData();
        if (jsonData === null) {
            return;
        }
        jsonData.content = content;
        await this.setJsonData(jsonData);
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
