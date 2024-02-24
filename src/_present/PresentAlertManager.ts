import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { isValidJson } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProviderPresent from './appProviderPresent';
import {
    AlertType, checkIsCountdownDatesEq, genHtmlAlertCountdown,
    genHtmlAlertMarquee, removeAlert,
} from './presentAlertHelpers';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentManagerInf from './PresentManagerInf';
import PresentTransitionEffect from
    './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { handleError } from '../helper/errorHelpers';

export type AlertDataType = {
    marqueeData: {
        text: string,
    } | null;
    countdownData: {
        dateTime: Date,
    } | null;
};
export type AlertSrcListType = {
    [key: string]: AlertDataType;
};

export type PresentAlertEventType = 'update';

const settingName = 'present-alert-';
export default class PresentAlertManager
    extends EventHandler<PresentAlertEventType>
    implements PresentManagerInf {
    static readonly eventNamePrefix: string = 'present-alert-m';
    readonly presentId: number;
    private alertData: AlertDataType = {
        marqueeData: null,
        countdownData: null,
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
                } = allAlertDataList[this.key];
                this.alertData.marqueeData = marqueeData;
                this.alertData.countdownData = countdownData;
            }
        }
    }
    getDivChild(divId: string) {
        if (this._div === null) {
            return document.createElement('div');
        }
        return this._div.querySelector(`#${divId}`) as HTMLDivElement;
    }
    get divCountdown() {
        return this.getDivChild('countdown');
    }
    get divMarquee() {
        return this.getDivChild('marquee');
    }
    set div(div: HTMLDivElement | null) {
        this._div = div;
        this.renderAll();
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
    setMarqueeData(marqueeData: { text: string } | null) {
        if (marqueeData?.text !== this.alertData.marqueeData?.text) {
            this.cleanRender(this.divMarquee);
            this.alertData.marqueeData = marqueeData;
            this.renderMarquee();
        }
    }
    setCountdownData(countdownData: { dateTime: Date } | null) {
        if (!checkIsCountdownDatesEq(countdownData?.dateTime || null,
            this.alertData.countdownData?.dateTime || null)) {
            this.cleanRender(this.divCountdown);
            this.alertData.countdownData = countdownData;
            this.renderCountdown();
        }
    }
    static receiveSyncPresent(message: PresentMessageType) {
        const presentManager = PresentManager.getInstance(message.presentId);
        if (presentManager === null) {
            return;
        }
        const { presentAlertManager } = presentManager;
        const data: AlertDataType = message.data;
        presentAlertManager.setMarqueeData(data.marqueeData);
        presentAlertManager.setCountdownData(data.countdownData);
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
        try {
            if (!isValidJson(str, true)) {
                return {};
            }
            const json = JSON.parse(str);
            Object.values(json).forEach((item: any) => {
                const { countdownData } = item;
                if (
                    !(
                        item.marqueeData === null ||
                        typeof item.marqueeData.text === 'string'
                    ) ||
                    !(
                        countdownData === null ||
                        typeof countdownData.dateTime === 'string'
                    )
                ) {
                    throw new Error('Invalid alert data');
                }
                if (countdownData?.dateTime) {
                    countdownData.dateTime = new Date(countdownData.dateTime);
                }
            });
            return json;
        } catch (error) {
            handleError(error);
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
            } else {
                return bgSrc.countdownData !== null;
            }
        });
    }
    static async setData(event: React.MouseEvent<HTMLElement, MouseEvent>,
        callback: (presentManager: PresentAlertManager) => void) {
        const chosenPresentManagers = await PresentManager
            .contextChooseInstances(event);
        const callbackSave = async (presentManager: PresentManager) => {
            callback(presentManager.presentAlertManager);
            presentManager.presentAlertManager.saveAlertData();
        };
        chosenPresentManagers.forEach((presentManager) => {
            callbackSave(presentManager);
        });
    }
    static async setMarquee(text: string,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.setData(event, (presentAlertManager) => {
            const { alertData } = presentAlertManager;
            const { text: dataText } = alertData.marqueeData || {};
            const marqueeData = dataText === text ? null : { text };
            presentAlertManager.setMarqueeData(marqueeData);
        });
    }
    static async setCountdown(dateTime: Date,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        this.setData(event, (presentAlertManager) => {
            const { alertData } = presentAlertManager;
            const { dateTime: dateTimeData } = alertData.countdownData || {};
            const countdownData = dateTimeData !== undefined
                && checkIsCountdownDatesEq(dateTimeData, dateTime) ?
                null : { dateTime };
            presentAlertManager.setCountdownData(countdownData);
        });
    }
    renderMarquee() {
        if (
            this.presentManager !== null && this.alertData.marqueeData !== null
        ) {
            const newDiv = genHtmlAlertMarquee(
                this.alertData.marqueeData, this.presentManager,
            );
            this.divMarquee.appendChild(newDiv);
            newDiv.querySelectorAll('.marquee').forEach((element: any) => {
                if (element.offsetWidth < element.scrollWidth) {
                    element.classList.add('moving');
                }
            });
        }
    }
    renderCountdown() {
        if (
            this.presentManager !== null &&
            this.alertData.countdownData !== null
        ) {
            const newDiv = genHtmlAlertCountdown(
                this.alertData.countdownData, this.presentManager,
            );
            this.divCountdown.appendChild(newDiv);
        }
    }
    renderAll() {
        this.renderMarquee();
        this.renderCountdown();
    }
    cleanRender(divContainer: HTMLDivElement) {
        const childList = Array.from(divContainer.children);
        childList.forEach((child) => {
            removeAlert(child);
        });
    }
    get containerStyle(): CSSProperties {
        const { presentManager } = this;
        if (presentManager === null) {
            return {};
        }
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${presentManager.width}px`,
            height: `${presentManager.height}px`,
            overflow: 'hidden',
        };
    }
    delete() {
        this.alertData.marqueeData = null;
        this.alertData.countdownData = null;
        this.saveAlertData();
    }
}
