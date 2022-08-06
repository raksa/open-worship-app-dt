import { getSetting, setSetting } from '../helper/settingHelper';

export type BackgroundType = 'color' | 'image' | 'video';
export type BackgroundSrcType = {
    type: BackgroundType;
    src: string;
};
export type BGSrcListType = {
    [key: string]: BackgroundSrcType;
};

const settingName = 'present-bg-';
export default class PresentBGManager {
    readonly presentId: number;
    readonly isMain: boolean = true;
    constructor(presentId: number, isPresent?: boolean) {
        this.presentId = presentId;
        this.isMain = !isPresent;
    }
    get key() {
        return this.presentId.toString();
    }
    get bgSrc() {
        const allBGSrcList = PresentBGManager.getBGSrcList();
        return allBGSrcList[this.key] || null;
    }
    set bgSrc(bgSrc: BackgroundSrcType | null) {
        const allBGSrcList = PresentBGManager.getBGSrcList();
        if (bgSrc === null) {
            delete allBGSrcList[this.key];
        } else {
            allBGSrcList[this.key] = bgSrc;
        }
        PresentBGManager.setBGSrcList(allBGSrcList);
        this.fireUpdate();
    }
    fireUpdate: () => void = () => void 0;
    static getBGSrcList(): BGSrcListType {
        const str = getSetting(settingName, '');
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
        setSetting(settingName, str);
    }
}
