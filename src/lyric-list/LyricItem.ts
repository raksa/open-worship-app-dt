import { toastEventListener } from '../event/ToastEventListener';
import FileSource from '../helper/FileSource';

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
    static fromJson(json: any, fileSource: FileSource) {
        this.validate(json);
        return new LyricItem(json.title, json.text, fileSource);
    }
    static fromJsonError(json: any, fileSource: FileSource) {
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
    static validate(json: any) {
        if (!json.title || !json.text) {
            console.log(json);
            throw new Error('Invalid lyric item data');
        }
    }
    clone() {
        try {
            return LyricItem.fromJson(this.toJson(), this.fileSource);
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Cloning Lyric Item',
                message: error.message,
            });
        }
        return null;
    }
}
