import { HAlignmentEnum, VAlignmentEnum } from '../editor/slideParser';
import { readFile } from './fileHelper';
import { getAppInfo } from './helpers';

export type ToolingType = {
    text?: {
        color?: string,
        fontSize?: number,
        horizontalAlignment?: HAlignmentEnum,
        verticalAlignment?: VAlignmentEnum,
    }
    box?: {
        backgroundColor?: string,
        rotate?: number,
        horizontalAlignment?: HAlignmentEnum,
        verticalAlignment?: VAlignmentEnum,
        layerBack?: boolean,
        layerFront?: boolean,
    }
};
export type SlidePresentType = {
    items: SlideItemThumbType[]
};
export type SlideItemThumbType = {
    id: string,
    html: string,
    isEditing?: boolean,
    slideFilePath: string,
};

export function validateMeta(meta: any) {
    try {
        if (meta.fileVersion === 1 && meta.app === 'OpenWorship') {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validateSlideItemThumb(item: any) {
    try {
        if (item.html && item.id) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validateSlide(json: any) {
    try {
        if (!json.items.length ||
            !(json.items as any[]).every((item) => validateSlideItemThumb(item))) {
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

export const getDefaultBoxHTML = (width: number = 700, height: number = 400) =>
    '<div class="box-editor pointer " style="top: 279px; left: 356px; transform: rotate(0deg); '
    + `width: ${width}px; height: ${height}px; z-index: 2; display: flex; font-size: 60px; `
    + 'color: rgb(255, 254, 254); align-items: center; justify-content: center; '
    + `background-color: rgba(255, 0, 255, 0.39); position: absolute;">${getAppInfo().name}</div>`;

export function defaultSlide(width: number, height: number) {
    return {
        metadata: {
            fileVersion: 1,
            app: 'OpenWorship',
            initDate: (new Date()).toJSON(),
        },
        items: [
            {
                id: '0', // TODO: set width and height for present screen
                html: `<div style="width: ${width}px; height: ${height}px;">`
                    + getDefaultBoxHTML()
                    + '</div>',
            },
        ],
    };
}

export function getSlideDataByFilePath(filePath: string) {
    try {
        const str = readFile(filePath);
        if (str !== null) {
            const json = JSON.parse(str);
            if (validateSlide(json)) {
                const data = json as SlidePresentType;
                data.items.forEach((item) => {
                    item.slideFilePath = filePath;
                });
                return data;
            }
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}