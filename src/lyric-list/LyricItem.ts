export default class LyricItem {
    title: string;
    text: string;
    constructor(title: string, text: string) {
        this.title = title;
        this.text = text;
    }
    toJson() {
        return {
            title: this.title,
            text: this.text,
        };
    }
    static validate(item: any) {
        try {
            if (item.title !== undefined && item.text !== undefined) {
                return true;
            }
        } catch (error) {
            console.log(error);
        }
        return false;
    }
}
