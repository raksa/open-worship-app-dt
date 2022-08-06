import { getSetting, setSetting } from '../helper/settingHelper';

export type BackgroundType = 'color' | 'image' | 'video';
export type BackgroundSrcType = {
    type: BackgroundType;
    src: string;
};
export type BGSrcListType = {
    [key: string]: BackgroundSrcType;
};

const setting = 'present-bg';
export default class PresentBGManager {
    _bgSrc: BackgroundSrcType | null = null;
    get bgSrc() {
        return this._bgSrc;
    }
    set bgSrc(bgSrc: BackgroundSrcType | null) {
        this._bgSrc = bgSrc;
        this.fireUpdate();
    }
    fireUpdate: () => void = () => void 0;
    static getBGSrcList(): BGSrcListType {
        const str = getSetting(setting, '');
        if (str !== '') {
            try {
                return JSON.parse(str);
            } catch (error) {
                console.error(error);
            }
        }
        return {};
    }
    static setBGSrcList(bgSrcList: BGSrcListType) {
        const str = JSON.stringify(bgSrcList);
        setSetting(setting, str);
    }
    static getBGSrcByKey(key: string): BackgroundSrcType | null {
        const allBGSrcList = this.getBGSrcList();
        return allBGSrcList[key] || null;
    }
    static setBGSrcByKey(key: string, bgSrc: BackgroundSrcType | null) {
        const allBGSrcList = this.getBGSrcList();
        if (bgSrc === null) {
            delete allBGSrcList[key];
        } else {
            allBGSrcList[key] = bgSrc;
        }
        this.setBGSrcList(allBGSrcList);
    }
}
