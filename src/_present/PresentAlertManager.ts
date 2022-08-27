import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProviderPresent from './appProviderPresent';
import { AlertType, genHtmlAlert, removeAlert } from './presentAlertHelpers';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';

export type AlertDataType = {
    marqueeData: string | null;
    countdownData: {
        time: number
    } | null;
    toastData: {
        text: string
    } | null;
};
export type AlertSrcListType = {
    [key: string]: AlertDataType;
};

export type PresentAlertEventType = 'update';

const settingName = 'present-alert-';
export default class PresentAlertManager extends EventHandler<PresentAlertEventType> {
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
                        || typeof item.marqueeData === 'string')) {
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
            if (alertType === 'marquee') {
                return bgSrc.marqueeData !== null;
            } else if (alertType === 'toast') {
                return bgSrc.toastData !== null;
            } else {
                return bgSrc.countdownData !== null;
            }
        });
    }
    static async setMarquee(text: string,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        const chosenPresentManagers = await PresentManager.contextChooseInstances(event);
        chosenPresentManagers.forEach(async (presentManager) => {
            const { alertData } = presentManager.presentAlertManager;
            alertData.marqueeData = alertData.marqueeData === text ? null : text;
            presentManager.presentAlertManager.saveAlertData();
        });
    }
    render() {
        if (this.div === null) {
            return;
        }
        if (this.alertData !== null) {
            const newDiv = genHtmlAlert(this.alertData, this.presentManager);
            const childList = Array.from(this.div.children);
            this.div.appendChild(newDiv);
            newDiv.querySelectorAll('.marquee').forEach((element: any) => {
                if (element.offsetWidth < element.scrollWidth) {
                    element.classList.add('moving');
                }
            });
            childList.forEach((child) => {
                removeAlert(child);
            });
        } else {
            if (this.div.lastChild !== null) {
                removeAlert(this.div.lastChild);
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
}
