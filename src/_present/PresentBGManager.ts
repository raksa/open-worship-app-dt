import EventHandler from '../event/EventHandler';
import FileSource from '../helper/FileSource';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProvider from './appProvider';
import { sendPresentMessage } from './presentHelpers';
import PresentManager from './PresentManager';

export type BackgroundType = 'color' | 'image' | 'video';
export type BackgroundSrcType = {
    type: BackgroundType;
    src: string;
};
export type BGSrcListType = {
    [key: string]: BackgroundSrcType;
};

export type PresentBGManagerEventType = 'update';

const settingName = 'present-bg-';
export default class PresentBGManager extends EventHandler<PresentBGManagerEventType> {
    static eventNamePrefix: string = 'present-bg-m';
    readonly presentId: number;
    _bgSrc: BackgroundSrcType | null = null;
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProvider.isMain) {
            const allBGSrcList = PresentBGManager.getBGSrcList();
            this._bgSrc = allBGSrcList[this.key] || null;
        }
    }
    get key() {
        return this.presentId.toString();
    }
    get bgSrc() {
        return this._bgSrc;
    }
    set bgSrc(bgSrc: BackgroundSrcType | null) {
        this._bgSrc = bgSrc;
        const allBGSrcList = PresentBGManager.getBGSrcList();
        if (bgSrc === null) {
            delete allBGSrcList[this.key];
        } else {
            allBGSrcList[this.key] = bgSrc;
        }
        PresentBGManager.setBGSrcList(allBGSrcList);
        this.syncPresent();
        this.fireUpdate();
    }
    syncPresent() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'background',
            data: this.bgSrc,
        });
    }
    fireUpdate() {
        this.addPropEvent('update');
        PresentBGManager.fireUpdateEvent();
        PresentManager.getInstance(this.presentId).fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
        PresentManager.fireUpdateEvent();
    }
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
    static getBGSrcListByType(bgType: BackgroundType) {
        const bgSrcList = PresentBGManager.getBGSrcList();
        return Object.entries(bgSrcList).filter(([_, bgSrc]) => {
            return bgSrc.type === bgType;
        });
    }
    static getSelectBGSrcList(fileSource: FileSource, bgType: BackgroundType) {
        const keyBGSrcList = this.getBGSrcListByType(bgType);
        return keyBGSrcList.filter(([_, bgSrc]) => {
            return bgSrc.src === fileSource.src;
        });
    }
    static async bgSrcSelect(fileSource: FileSource,
        e: React.MouseEvent<HTMLElement, MouseEvent>,
        bgType: BackgroundType) {
        const selectedBGSrcList = this.getSelectBGSrcList(fileSource, bgType);
        if (selectedBGSrcList.length > 0) {
            selectedBGSrcList.forEach(([key]) => {
                PresentManager.getInstanceByKey(key)
                    .presentBGManager.bgSrc = null;
            });
            return;
        }
        const chosenPresentManagers = await PresentManager.contextChooseInstances(e);
        chosenPresentManagers.forEach((presentManager) => {
            presentManager.presentBGManager.bgSrc = {
                type: bgType,
                src: fileSource.src,
            };
        });
    }
}
