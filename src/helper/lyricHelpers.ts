import { validateMeta } from './helpers';

export type LyricItemType = {
    title: string,
    text: string,
};
export type LyricType = {
    index?: number,
    fileName:string,
    items: LyricItemType[],
};

function validateLyricItem(item: any) {
    try {
        if (item.title !== undefined && item.text !== undefined) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validateLyric(json: any) {
    try {
        json.items = json.items || [];
        if (!(json.items as any[]).every((item) => validateLyricItem(item))) {
            return false;
        }
        if (json.index !== undefined && typeof json.index !== 'number') {
            return false;
        }
        if (!validateMeta(json.metadata)) {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
}
