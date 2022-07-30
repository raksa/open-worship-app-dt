import FileSource from '../helper/FileSource';
import { AnyObjectType, cloneObject } from '../helper/helpers';

export default class LyricItem {
    title: string;
    text: string;
    fileSource: FileSource;
    jsonError: any;
    constructor(title: string, text: string, fileSource: FileSource) {
        this.title = title;
        this.text = text;
        this.fileSource = fileSource;
    }
    get isError() {
        return !!this.jsonError;
    }
    static fromJson(json: AnyObjectType, fileSource: FileSource) {
        this.validate(json);
        return new LyricItem(json.title, json.text, fileSource);
    }
    static fromJsonError(json: AnyObjectType, fileSource: FileSource) {
        const item = new LyricItem('', '', fileSource);
        item.jsonError = json;
        return item;
    }
    toJson() {
        if (this.isError) {
            return this.jsonError;
        }
        const json = {
            title: this.title,
            text: this.text,
        };
        LyricItem.validate(json);
        return json;
    }
    static validate(json: AnyObjectType) {
        if (!json.title || !json.text) {
            console.log(json);
            throw new Error('Invalid lyric item data');
        }
    }
    clone() {
        return cloneObject(this);
    }
}
