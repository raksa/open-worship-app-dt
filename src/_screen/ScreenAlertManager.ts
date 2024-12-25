import { CSSProperties } from 'react';

import { setSetting } from '../helper/settingHelpers';
import {
    AlertType, checkIsCountdownDatesEq, genHtmlAlertCountdown,
    genHtmlAlertMarquee, removeAlert,
} from './screenAlertHelpers';
import {
    AlertDataType, BasicScreenMessageType, getAlertDataListOnScreenSetting,
    ScreenMessageType,
} from './screenHelpers';
import ScreenManager from './ScreenManager';
import { screenManagerSettingNames } from '../helper/constants';
import { chooseScreenManagerInstances } from './screenManagerHelpers';
import { unlocking } from '../server/appHelpers';
import ScreenEventHandler from './ScreenEventHandler';

export type ScreenAlertEventType = 'update';

export default class ScreenAlertManager
    extends ScreenEventHandler<ScreenAlertEventType> {

    static readonly eventNamePrefix: string = 'screen-alert-m';
    private _div: HTMLDivElement | null = null;
    alertData: AlertDataType;

    constructor(screenId: number) {
        super(screenId);
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

    applyAlertDataWithSyncGroup(
        alertData: AlertDataType, isNoSyncGroup = false,
    ) {
        if (!isNoSyncGroup) {
            ScreenAlertManager.enableSyncGroup(this.screenId);
        }
        Object.assign(this.alertData, alertData);
    }

    saveAlertData() {
        unlocking(screenManagerSettingNames.ALERT, () => {
            const allAlertDataList = getAlertDataListOnScreenSetting();
            allAlertDataList[this.key] = this.alertData;
            const string = JSON.stringify(allAlertDataList);
            setSetting(screenManagerSettingNames.ALERT, string);
        });
        this.sendSyncScreen();
        this.fireUpdateEvent();
    }

    toSyncMessage(): BasicScreenMessageType {
        return {
            type: 'alert',
            data: this.alertData,
        };
    }

    setMarqueeData(
        marqueeData: { text: string } | null, isNoSyncGroup = false,
    ) {
        if (marqueeData?.text !== this.alertData.marqueeData?.text) {
            this.cleanRender(this.divMarquee);
            this.applyAlertDataWithSyncGroup({
                ...this.alertData, marqueeData,
            }, isNoSyncGroup);
            this.renderMarquee();
            this.saveAlertData();
        }
    }

    setCountdownData(
        countdownData: { dateTime: Date } | null, isNoSyncGroup = false,
    ) {
        if (
            !checkIsCountdownDatesEq(
                countdownData?.dateTime || null,
                this.alertData.countdownData?.dateTime || null,
            )
        ) {
            this.cleanRender(this.divCountdown);
            this.applyAlertDataWithSyncGroup({
                ...this.alertData, countdownData,
            }, isNoSyncGroup);
            this.renderCountdown();
            this.saveAlertData();
        }
    }

    receiveSyncScreen(message: ScreenMessageType) {
        const data: AlertDataType = message.data;
        this.setMarqueeData(data.marqueeData, true);
        this.setCountdownData(data.countdownData, true);
        this.fireUpdateEvent();
    }

    fireUpdateEvent() {
        super.fireUpdateEvent();
        ScreenAlertManager.fireUpdateEvent();
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
        isForceChoosing: boolean,
    ) {
        const callbackSave = async (screenManager: ScreenManager) => {
            callback(screenManager);
            screenManager.screenAlertManager.saveAlertData();
        };
        const chosenScreenManagers = await chooseScreenManagerInstances(
            event, isForceChoosing,
        );
        chosenScreenManagers.forEach((screenManager) => {
            callbackSave(screenManager);
        });
    }

    static async setMarquee(
        event: React.MouseEvent<HTMLElement, MouseEvent>, text: string | null,
        isForceChoosing = false,
    ) {
        this.setData(event, ({ screenAlertManager }) => {
            const marqueeData = text !== null ? { text } : null;
            screenAlertManager.setMarqueeData(marqueeData);
        }, isForceChoosing);
    }

    static async setCountdown(
        event: React.MouseEvent<HTMLElement, MouseEvent>, dateTime: Date | null,
        isForceChoosing = false,
    ) {
        this.setData(event, ({ screenAlertManager }) => {
            const countdownData = dateTime !== null ? { dateTime } : null;
            screenAlertManager.setCountdownData(countdownData);
        }, isForceChoosing);
    }

    renderMarquee() {
        if (this.alertData.marqueeData !== null) {
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
        if (this.alertData.countdownData !== null) {
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
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${this.screenManager.width}px`,
            height: `${this.screenManager.height}px`,
            overflow: 'hidden',
        };
    }

    static receiveSyncScreen(message: ScreenMessageType) {
        const { screenId } = message;
        const { screenAlertManager } = this.getScreenManager(screenId);
        screenAlertManager.receiveSyncScreen(message);
    }

    render() {
        console.log('render');
    }

    clear() {
        this.setCountdownData(null);
        this.setMarqueeData(null);
        this.saveAlertData();
    }
}
