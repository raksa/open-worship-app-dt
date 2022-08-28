import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProviderPresent from './appProviderPresent';
import {
    AlertType,
    checkIsCountdownDates,
    genHtmlAlertCountdown,
    genHtmlAlertMarquee,
    removeAlert,
} from './presentAlertHelpers';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentManagerInf from './PresentManagerInf';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';

export type AlertDataType = {
    marqueeData: {
        text: string,
    } | null;
    countdownData: {
        dateTime: Date,
    } | null;
    toastData: {
        text: string,
    } | null;
};
export type AlertSrcListType = {
    [key: string]: AlertDataType;
};

export type PresentAlertEventType = 'update';

const settingName = 'present-alert-';
export default class PresentAlertManager extends EventHandler<PresentAlertEventType>
    implements PresentManagerInf {
    static eventNamePrefix: string = 'present-alert-m';
    readonly presentId: number;
    private alertData: AlertDataType = {
        marqueeData: null,
        countdownData: null,
        toastData: null,
    };
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'slide';
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProviderPresent.isMain) {
            const allAlertDataList = PresentAlertManager.getAlertDataList();
            if (allAlertDataList[this.key] !== undefined) {
                const {
                    marqueeData,
                    countdownData,
                    toastData,
                } = allAlertDataList[this.key];
                this.alertData.marqueeData = marqueeData || null;
                this.alertData.countdownData = countdownData || null;
                this.alertData.toastData = toastData || null;
            }
        }
    }
    getDivChild(divId: string) {
        if (this._div === null) {
            return null;
        }
        return this._div.querySelector(`#${divId}`) as HTMLDivElement;
    }
    get divCountdown() {
        return this.getDivChild('countdown');
    }
    get divMarquee() {
        return this.getDivChild('marquee');
    }
    get divToast() {
        return this.getDivChild('toast');
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
    saveAlertData() {
        this.render();
        const allAlertDataList = PresentAlertManager.getAlertDataList();
        allAlertDataList[this.key] = this.alertData;
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
        const { presentAlertManager } = presentManager;
        presentAlertManager.alertData = data;
        presentAlertManager.render();
        presentAlertManager.fireUpdate();
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
                    if (!(item.marqueeData === null
                        || typeof item.marqueeData.text === 'string') ||
                        !(item.countdownData === null
                            || typeof item.countdownData.dateTime === 'string')) {
                        throw new Error('Invalid alert data');
                    }
                    if (item.countdownData?.dateTime) {
                        item.countdownData.dateTime = new Date(item.countdownData.dateTime);
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
            if (alertType === 'marquee') {
                return bgSrc.marqueeData !== null;
            } else if (alertType === 'toast') {
                return bgSrc.toastData !== null;
            } else {
                return bgSrc.countdownData !== null;
            }
        });
    }
    static async setData(event: React.MouseEvent<HTMLElement, MouseEvent>,
        callback: (presentManager: PresentManager) => void) {
        const chosenPresentManagers = await PresentManager.contextChooseInstances(event);
        chosenPresentManagers.forEach(async (presentManager) => {
            callback(presentManager);
            presentManager.presentAlertManager.saveAlertData();
        });
    }
    static async setMarquee(text: string,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.setData(event, (presentManager) => {
            const { alertData } = presentManager.presentAlertManager;
            const { text: dataText } = alertData.marqueeData || {};
            alertData.marqueeData = dataText === text ? null : { text };
        });
    }
    static async setCountdown(dateTime: Date,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.setData(event, (presentManager) => {
            const { alertData } = presentManager.presentAlertManager;
            const { dateTime: dateTimeData } = alertData.countdownData || {};
            alertData.countdownData = dateTimeData !== undefined
                && checkIsCountdownDates(dateTimeData, dateTime) ? null : { dateTime };
        });
    }
    render() {
        if (this.divMarquee !== null && this.alertData.marqueeData !== null) {
            const newDiv = genHtmlAlertMarquee(this.alertData.marqueeData,
                this.presentManager);
            const childList = Array.from(this.divMarquee.children);
            this.divMarquee.appendChild(newDiv);
            newDiv.querySelectorAll('.marquee').forEach((element: any) => {
                if (element.offsetWidth < element.scrollWidth) {
                    element.classList.add('moving');
                }
            });
            childList.forEach((child) => {
                removeAlert(child);
            });
        }
        if (this.divCountdown !== null && this.alertData.countdownData !== null) {
            const newDiv = genHtmlAlertCountdown(this.alertData.countdownData,
                this.presentManager);
            const childList = Array.from(this.divCountdown.children);
            this.divCountdown.appendChild(newDiv);
            childList.forEach((child) => {
                removeAlert(child);
            });
        }
        this.cleanRender();
    }
    cleanRender() {
        if (this.divMarquee !== null && this.alertData.marqueeData === null) {
            if (this.divMarquee.lastChild !== null) {
                removeAlert(this.divMarquee.lastChild);
            }
        }
        if (this.divCountdown !== null && this.alertData.countdownData === null) {
            if (this.divCountdown.lastChild !== null) {
                removeAlert(this.divCountdown.lastChild);
            }
        }
    }
    get containerStyle(): React.CSSProperties {
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${this.presentManager.width}px`,
            height: `${this.presentManager.height}px`,
            overflow: 'hidden',
        };
    }
    delete() {
        this.alertData.marqueeData = null;
        this.alertData.countdownData = null;
        this.alertData.toastData = null;
        this.saveAlertData();
    }
}
