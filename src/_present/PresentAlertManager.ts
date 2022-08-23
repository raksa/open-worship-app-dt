import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';
import { createMouseEvent } from '../others/AppContextMenu';
import appProviderPresent from './appProviderPresent';
import { genHtmlAlert } from './presentAlertHelpers';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';

const alertTypeList = ['marquee', 'countdown', 'toast'] as const;
export type AlertType = typeof alertTypeList[number];
export type AlertDataType = {
    type: AlertType;
    marqueeData?: string
    countdownData?: {
        time: number
    }
    toastData?: {
        text: string
    }
};
export type AlertSrcListType = {
    [key: string]: AlertDataType;
};

export type PresentAlertEventType = 'update';

const settingName = 'present-alert-';
export default class PresentAlertManager extends EventHandler<PresentAlertEventType> {
    static eventNamePrefix: string = 'present-alert-m';
    readonly presentId: number;
    private _alertData: AlertDataType | null = null;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'slide';
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProviderPresent.isMain) {
            const allAlertDataList = PresentAlertManager.getAlertDataList();
            this._alertData = allAlertDataList[this.key] || null;
        }
    }
    get div() {
        return this._div;
    }
    set div(div: HTMLDivElement | null) {
        this._div = div;
        this.render();
    }
    get ptEffect() {
        return PresentTransitionEffect.getInstance(
            this.presentId, this.ptEffectTarget);
    }
    get presentManager() {
        return PresentManager.getInstance(this.presentId);
    }
    get key() {
        return this.presentId.toString();
    }
    get alertData() {
        return this._alertData;
    }
    set alertData(alertData: AlertDataType | null) {
        this._alertData = alertData;
        this.render();
        const allAlertDataList = PresentAlertManager.getAlertDataList();
        if (alertData === null) {
            delete allAlertDataList[this.key];
        } else {
            allAlertDataList[this.key] = alertData;
        }
        PresentAlertManager.setAlertDataList(allAlertDataList);
        this.sendSyncPresent();
        this.fireUpdate();
    }
    sendSyncPresent() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'alert',
            data: this.alertData,
        });
    }
    static receiveSyncPresent(message: PresentMessageType) {
        const { data, presentId } = message;
        const presentManager = PresentManager.getInstance(presentId);
        presentManager.presentAlertManager.alertData = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        PresentAlertManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
    }
    static getAlertDataList(): AlertSrcListType {
        const str = getSetting(settingName, '');
        if (str !== '') {
            try {
                const json = JSON.parse(str);
                Object.values(json).forEach((item: any) => {
                    if (!alertTypeList.includes(item.type)
                        || (item.type === 'marquee'
                            && typeof item.marqueeData !== 'string')) {
                        throw new Error('Invalid alert data');
                    }
                });
                return json;
            } catch (error) {
                console.log(str);
                console.error(error);
            }
        }
        return {};
    }
    static setAlertDataList(alertDataList: AlertSrcListType) {
        const str = JSON.stringify(alertDataList);
        setSetting(settingName, str);
    }
    static getAlertDataListByType(alertType: AlertType) {
        const alertDataList = this.getAlertDataList();
        return Object.entries(alertDataList).filter(([_, bgSrc]) => {
            return bgSrc.type === alertType;
        });
    }
    static async showMarquee(text: string,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        const chosenPresentManagers = await PresentManager.contextChooseInstances(event);
        chosenPresentManagers.forEach(async (presentManager) => {
            presentManager.presentAlertManager.alertData = {
                type: 'marquee',
                marqueeData: text,
            };
        });
        this.fireUpdateEvent();
    }
    render() {
        if (this.div === null) {
            return;
        }
        const aminData = this.ptEffect.styleAnim;
        if (this.alertData !== null) {
            // TODO: apply scale like slide
            const newDiv = genHtmlAlert(this.alertData, this.presentManager);
            const childList = Array.from(this.div.children);
            this.div.appendChild(newDiv);
            // TODO: move from bottom
            aminData.animIn(newDiv).then(() => {
                childList.forEach((child) => {
                    child.remove();
                });
            });
        } else {
            if (this.div.lastChild !== null) {
                const targetDiv = this.div.lastChild as HTMLDivElement;
                aminData.animOut(targetDiv).then(() => {
                    targetDiv.remove();
                });
            }
        }
    }
    get containerStyle(): React.CSSProperties {
        return {
            position: 'absolute',
            width: `${this.presentManager.width}px`,
            height: `${this.presentManager.height}px`,
            overflow: 'hidden',
        };
    }
}

(window as any).showMarquee = () => {
    const text = '(4): And the serpent said unto the woman, Ye shall not surely '
        + 'die: (5): for God doth know that in the day ye eat thereof, then your '
        + 'eyes shall be opened, and ye shall be as gods, knowing good and evil. '
        + '(6): And when the woman saw that the tree was good for food, and that '
        + 'it was pleasant to the eyes, and a tree to be desired to make one wise, '
        + 'she took of the fruit thereof, and did eat, and gave also unto her '
        + 'husband with her; and he did eat. (7): And the eyes of them both were '
        + 'opened, and they knew that they were naked; and they sewed fig leaves '
        + 'together, and made themselves aprons.';
    PresentAlertManager.showMarquee(text, createMouseEvent(0, 0) as any);
};
