import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { setSetting } from '../helper/settingHelpers';
import {
    AlertType, checkIsCountdownDatesEq, genHtmlAlertCountdown,
    genHtmlAlertMarquee, removeAlert,
} from './screenAlertHelpers';
import { sendScreenMessage } from './screenEventHelpers';
import {
    AlertDataType, getAlertDataListOnScreenSetting, ScreenMessageType,
} from './screenHelpers';
import ScreenManager from './ScreenManager';
import ScreenManagerInf from './ScreenManagerInf';
import ScreenTransitionEffect from
    './transition-effect/ScreenTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { screenManagerSettingNames } from '../helper/constants';
import { chooseScreenManagerInstances } from './screenManagerHelpers';
import { unlocking } from '../server/appHelpers';

export type ScreenAlertEventType = 'update';

export default class ScreenAlertManager
    extends EventHandler<ScreenAlertEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-alert-m';
    readonly screenId: number;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'slide';
    alertData: AlertDataType;

    constructor(screenId: number) {
        super();
        this.screenId = screenId;
        const allAlertDataList = getAlertDataListOnScreenSetting();
        this.alertData = allAlertDataList[this.key] ?? {
            marqueeData: null,
            countdownData: null,
        };
    }

    getDivChild(divId: string) {
        if (this._div === null) {
            return document.createElement('div');
        }
        return this._div.querySelector(`#${divId}`) as HTMLDivElement;
    }

    get isMarqueeShowing() {
        return this.alertData.marqueeData !== null;
    }

    get isCountdownShowing() {
        return this.alertData.countdownData !== null;
    }

    get isShowing() {
        return this.isMarqueeShowing || this.isCountdownShowing;
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
        unlocking(screenManagerSettingNames.ALERT, () => {
            const allAlertDataList = getAlertDataListOnScreenSetting();
            allAlertDataList[this.key] = this.alertData;
            const string = JSON.stringify(allAlertDataList);
            setSetting(screenManagerSettingNames.ALERT, string);
        });
        this.sendSyncScreen();
        this.fireUpdate();
    }

    sendSyncScreen() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'alert',
            data: this.alertData,
        });
    }

    setMarqueeData(marqueeData: { text: string } | null) {
        if (marqueeData?.text !== this.alertData.marqueeData?.text) {
            this.cleanRender(this.divMarquee);
            this.alertData.marqueeData = marqueeData;
            this.renderMarquee();
            this.saveAlertData();
        }
    }

    setCountdownData(countdownData: { dateTime: Date } | null) {
        if (
            !checkIsCountdownDatesEq(
                countdownData?.dateTime || null,
                this.alertData.countdownData?.dateTime || null,
            )
        ) {
            this.cleanRender(this.divCountdown);
            this.alertData.countdownData = countdownData;
            this.renderCountdown();
            this.saveAlertData();
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

    static getAlertDataListByType(alertType: AlertType) {
        const alertDataList = getAlertDataListOnScreenSetting();
        return Object.entries(alertDataList).filter(([_, backgroundSrc]) => {
            if (alertType === 'marquee') {
                return backgroundSrc.marqueeData !== null;
            } else {
                return backgroundSrc.countdownData !== null;
            }
        });
    }

    static async setData(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        callback: (screenManager: ScreenManager) => void,
    ) {
        const chosenScreenManagers = await chooseScreenManagerInstances(event);
        const callbackSave = async (screenManager: ScreenManager) => {
            callback(screenManager);
            screenManager.screenAlertManager.saveAlertData();
        };
        chosenScreenManagers.forEach((screenManager) => {
            callbackSave(screenManager);
        });
    }

    static async setMarquee(
        event: React.MouseEvent<HTMLElement, MouseEvent>, text: string | null,
    ) {
        this.setData(event, ({ screenAlertManager }) => {
            const marqueeData = text !== null ? { text } : null;
            screenAlertManager.setMarqueeData(marqueeData);
        });
    }

    static async setCountdown(
        event: React.MouseEvent<HTMLElement, MouseEvent>, dateTime: Date | null,
    ) {
        this.setData(event, ({ screenAlertManager }) => {
            const countdownData = dateTime !== null ? { dateTime } : null;
            screenAlertManager.setCountdownData(countdownData);
        });
    }

    renderMarquee() {
        if (
            this.screenManager !== null && this.alertData.marqueeData !== null
        ) {
            const newDiv = genHtmlAlertMarquee(
                this.alertData.marqueeData, this.screenManager,
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
            this.alertData.countdownData !== null
        ) {
            const newDiv = genHtmlAlertCountdown(
                this.alertData.countdownData, this.screenManager,
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

    clear() {
        this.setCountdownData(null);
        this.setMarqueeData(null);
        this.saveAlertData();
    }
}
