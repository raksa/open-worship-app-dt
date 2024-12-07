import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { setSetting } from '../helper/settingHelpers';
import appProviderScreen from './appProviderScreen';
import {
    AlertType, checkIsCountdownDatesEq, genHtmlAlertCountdown,
    genHtmlAlertMarquee, removeAlert,
} from './screenAlertHelpers';
import { sendScreenMessage } from './screenEventHelpers';
import {
    AlertDataType, AlertSrcListType, getAlertDataListOnScreenSetting,
    ScreenMessageType,
} from './screenHelpers';
import ScreenManager from './ScreenManager';
import ScreenManagerInf from './ScreenManagerInf';
import ScreenTransitionEffect from
    './transition-effect/ScreenTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { screenManagerSettingNames } from '../helper/constants';

export type ScreenAlertEventType = 'update';

const alertData: AlertDataType = {
    marqueeData: null,
    countdownData: null,
};
export default class ScreenAlertManager
    extends EventHandler<ScreenAlertEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-alert-m';
    readonly screenId: number;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'slide';

    constructor(screenId: number) {
        super();
        this.screenId = screenId;
        if (appProviderScreen.isPresenter) {
            const allAlertDataList = getAlertDataListOnScreenSetting();
            if (allAlertDataList[this.key] !== undefined) {
                const {
                    marqueeData,
                    countdownData,
                } = allAlertDataList[this.key];
                alertData.marqueeData = marqueeData;
                alertData.countdownData = countdownData;
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
        return ScreenTransitionEffect.getInstance(
            this.screenId, this.ptEffectTarget,
        );
    }

    get screenManager() {
        return ScreenManager.getInstance(this.screenId);
    }

    get key() {
        return this.screenId.toString();
    }

    saveAlertData() {
        const allAlertDataList = getAlertDataListOnScreenSetting();
        allAlertDataList[this.key] = alertData;
        ScreenAlertManager.setAlertDataList(allAlertDataList);
        this.sendSyncScreen();
        this.fireUpdate();
    }

    sendSyncScreen() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'alert',
            data: alertData,
        });
    }

    setMarqueeData(marqueeData: { text: string } | null) {
        if (marqueeData?.text !== alertData.marqueeData?.text) {
            this.cleanRender(this.divMarquee);
            alertData.marqueeData = marqueeData;
            this.renderMarquee();
        }
    }

    setCountdownData(countdownData: { dateTime: Date } | null) {
        if (!checkIsCountdownDatesEq(countdownData?.dateTime || null,
            alertData.countdownData?.dateTime || null)) {
            this.cleanRender(this.divCountdown);
            alertData.countdownData = countdownData;
            this.renderCountdown();
        }
    }

    static receiveSyncScreen(message: ScreenMessageType) {
        const screenManager = ScreenManager.getInstance(message.screenId);
        if (screenManager === null) {
            return;
        }
        const { screenAlertManager } = screenManager;
        const data: AlertDataType = message.data;
        screenAlertManager.setMarqueeData(data.marqueeData);
        screenAlertManager.setCountdownData(data.countdownData);
        screenAlertManager.fireUpdate();
    }

    fireUpdate() {
        this.addPropEvent('update');
        ScreenAlertManager.fireUpdateEvent();
    }

    static fireUpdateEvent() {
        this.addPropEvent('update');
    }

    static setAlertDataList(alertDataList: AlertSrcListType) {
        const str = JSON.stringify(alertDataList);
        setSetting(screenManagerSettingNames.ALERT, str);
    }

    static getAlertDataListByType(alertType: AlertType) {
        const alertDataList = getAlertDataListOnScreenSetting();
        return Object.entries(alertDataList).filter(([_, bgSrc]) => {
            if (alertType === 'marquee') {
                return bgSrc.marqueeData !== null;
            } else {
                return bgSrc.countdownData !== null;
            }
        });
    }

    static async setData(event: React.MouseEvent<HTMLElement, MouseEvent>,
        callback: (screenManager: ScreenAlertManager) => void) {
        const chosenScreenManagers = (
            await ScreenManager.contextChooseInstances(event)
        );
        const callbackSave = async (screenManager: ScreenManager) => {
            callback(screenManager.screenAlertManager);
            screenManager.screenAlertManager.saveAlertData();
        };
        chosenScreenManagers.forEach((screenManager) => {
            callbackSave(screenManager);
        });
    }

    static async setMarquee(
        text: string, event: React.MouseEvent<HTMLElement, MouseEvent>,
    ) {
        this.setData(event, (screenAlertManager) => {
            const { text: dataText } = alertData.marqueeData || {};
            const marqueeData = dataText === text ? null : { text };
            screenAlertManager.setMarqueeData(marqueeData);
        });
    }

    static async setCountdown(
        dateTime: Date, event: React.MouseEvent<HTMLElement, MouseEvent>,
    ) {
        this.setData(event, (screenAlertManager) => {
            const { dateTime: dateTimeData } = alertData.countdownData || {};
            const countdownData = (
                (
                    dateTimeData !== undefined &&
                    checkIsCountdownDatesEq(dateTimeData, dateTime)
                ) ? null : { dateTime }
            );
            screenAlertManager.setCountdownData(countdownData);
        });
    }

    renderMarquee() {
        if (
            this.screenManager !== null && alertData.marqueeData !== null
        ) {
            const newDiv = genHtmlAlertMarquee(
                alertData.marqueeData, this.screenManager,
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
            this.screenManager !== null &&
            alertData.countdownData !== null
        ) {
            const newDiv = genHtmlAlertCountdown(
                alertData.countdownData, this.screenManager,
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
        const { screenManager } = this;
        if (screenManager === null) {
            return {};
        }
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${screenManager.width}px`,
            height: `${screenManager.height}px`,
            overflow: 'hidden',
        };
    }

    delete() {
        alertData.marqueeData = null;
        alertData.countdownData = null;
        this.saveAlertData();
    }
}
