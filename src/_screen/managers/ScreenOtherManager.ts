import { CSSProperties } from 'react';

import { setSetting } from '../../helper/settingHelpers';
import {
    AlertType,
    checkIsCountdownDatesEq,
    genHtmlAlertCountdown,
    genHtmlAlertMarquee,
    getAndShowMedia,
    removeAlert,
} from '../screenOtherHelpers';
import { getAlertDataListOnScreenSetting } from '../screenHelpers';
import { screenManagerSettingNames } from '../../helper/constants';
import ScreenEventHandler from './ScreenEventHandler';
import ScreenManagerBase from './ScreenManagerBase';
import { unlocking } from '../../server/unlockingHelpers';
import {
    AlertDataType,
    BasicScreenMessageType,
    ScreenMessageType,
} from '../screenTypeHelpers';

export type ScreenOtherEventType = 'update';

export default class ScreenOtherManager extends ScreenEventHandler<ScreenOtherEventType> {
    static readonly eventNamePrefix: string = 'screen-alert-m';
    private _div: HTMLDivElement | null = null;
    alertData: AlertDataType;
    clearCameraTracks: () => void = () => {};

    constructor(screenManagerBase: ScreenManagerBase) {
        super(screenManagerBase);
        const allAlertDataList = getAlertDataListOnScreenSetting();
        const alertData = allAlertDataList[this.key] ?? {};
        this.alertData = {
            countdownData: alertData['countdownData'] ?? null,
            marqueeData: alertData['marqueeData'] ?? null,
            cameraData: alertData['cameraData'] ?? null,
        };
    }

    getDivChild(divId: string) {
        if (this._div === null) {
            return document.createElement('div');
        }
        return this._div.querySelector(`#${divId}`) as HTMLDivElement;
    }

    get isCountdownShowing() {
        return this.alertData.countdownData !== null;
    }

    get isMarqueeShowing() {
        return this.alertData.marqueeData !== null;
    }

    get isCameraShowing() {
        return this.alertData.cameraData !== null;
    }

    get isShowing() {
        return (
            this.isCountdownShowing ||
            this.isMarqueeShowing ||
            this.isCameraShowing
        );
    }

    get divCountdown() {
        return this.getDivChild('countdown');
    }

    get divMarquee() {
        return this.getDivChild('marquee');
    }

    get divCamera() {
        return this.getDivChild('camera');
    }

    set div(div: HTMLDivElement | null) {
        this._div = div;
        this.renderAll();
    }

    applyAlertDataWithSyncGroup(
        alertData: AlertDataType,
        isNoSyncGroup = false,
    ) {
        if (!isNoSyncGroup) {
            ScreenOtherManager.enableSyncGroup(this.screenId);
        }
        Object.assign(this.alertData, alertData);
    }

    saveAlertData() {
        unlocking(screenManagerSettingNames.ALERT, () => {
            const allAlertDataList = getAlertDataListOnScreenSetting();
            allAlertDataList[this.key] = this.alertData;
            const string = JSON.stringify(allAlertDataList);
            setSetting(screenManagerSettingNames.ALERT, string);
            this.fireUpdateEvent();
        });
        this.sendSyncScreen();
    }

    toSyncMessage(): BasicScreenMessageType {
        return {
            type: 'alert',
            data: this.alertData,
        };
    }

    setCountdownData(
        countdownData: {
            dateTime: Date;
            extraStyle: React.CSSProperties;
        } | null,
        isNoSyncGroup = false,
    ) {
        if (
            this.screenManagerBase.checkIsLockedWithMessage() ||
            checkIsCountdownDatesEq(
                countdownData?.dateTime ?? null,
                this.alertData.countdownData?.dateTime ?? null,
            )
        ) {
            return;
        }
        this.cleanRender(this.divCountdown);
        this.applyAlertDataWithSyncGroup(
            {
                ...this.alertData,
                countdownData,
            },
            isNoSyncGroup,
        );
        this.renderCountdown();
        this.saveAlertData();
    }

    setMarqueeData(
        marqueeData: { text: string } | null,
        isNoSyncGroup = false,
    ) {
        if (
            this.screenManagerBase.checkIsLockedWithMessage() ||
            marqueeData?.text === this.alertData.marqueeData?.text
        ) {
            return;
        }
        this.cleanRender(this.divMarquee);
        this.applyAlertDataWithSyncGroup(
            {
                ...this.alertData,
                marqueeData,
            },
            isNoSyncGroup,
        );
        this.renderMarquee();
        this.saveAlertData();
    }

    setCameraData(
        cameraData: { id: string; extraStyle: React.CSSProperties } | null,
        isNoSyncGroup = false,
    ) {
        if (
            this.screenManagerBase.checkIsLockedWithMessage() ||
            cameraData?.id === this.alertData.cameraData?.id
        ) {
            return;
        }
        this.cleanRender(this.divCamera);
        this.applyAlertDataWithSyncGroup(
            {
                ...this.alertData,
                cameraData,
            },
            isNoSyncGroup,
        );
        this.renderCamera();
        this.saveAlertData();
    }

    receiveSyncScreen(message: ScreenMessageType) {
        const data: AlertDataType = message.data;
        this.setCountdownData(data.countdownData, true);
        this.setMarqueeData(data.marqueeData, true);
        this.setCameraData(data.cameraData, true);
        this.fireUpdateEvent();
    }

    fireUpdateEvent() {
        super.fireUpdateEvent();
        ScreenOtherManager.fireUpdateEvent();
    }

    static getAlertDataListByType(alertType: AlertType) {
        const alertDataList = getAlertDataListOnScreenSetting();
        return Object.entries(alertDataList).filter(([_, backgroundSrc]) => {
            if (alertType === 'countdown') {
                return backgroundSrc.countdownData !== null;
            }
            if (alertType === 'marquee') {
                return backgroundSrc.marqueeData !== null;
            }
            if (alertType === 'camera') {
                return backgroundSrc.countdownData !== null;
            }
        });
    }

    static async setData(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        callback: (screenOtherManager: ScreenOtherManager) => void,
        isForceChoosing: boolean,
    ) {
        const callbackSave = async (screenOtherManager: ScreenOtherManager) => {
            callback(screenOtherManager);
            screenOtherManager.saveAlertData();
        };
        const screenIds = await this.chooseScreenIds(event, isForceChoosing);
        screenIds.forEach((screenId) => {
            callbackSave(this.getInstance(screenId));
        });
    }

    static async setCountdown(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        dateTime: Date | null,
        extraStyle: CSSProperties = {},
        isForceChoosing = false,
    ) {
        this.setData(
            event,
            (screenOtherManager) => {
                const countdownData =
                    dateTime !== null ? { dateTime, extraStyle } : null;
                screenOtherManager.setCountdownData(countdownData);
            },
            isForceChoosing,
        );
    }

    static async setMarquee(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        text: string | null,
        isForceChoosing = false,
    ) {
        this.setData(
            event,
            (screenOtherManager) => {
                const marqueeData = text !== null ? { text } : null;
                screenOtherManager.setMarqueeData(marqueeData);
            },
            isForceChoosing,
        );
    }

    static async setCamera(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        id: string | null,
        extraStyle: CSSProperties = {},
        isForceChoosing = false,
    ) {
        this.setData(
            event,
            (screenOtherManager) => {
                const cameraData = id !== null ? { id, extraStyle } : null;
                screenOtherManager.setCameraData(cameraData);
            },
            isForceChoosing,
        );
    }

    renderCountdown() {
        this.cleanRender(this.divCountdown);
        if (this.alertData.countdownData === null) {
            return;
        }
        this.moveToTheEnd(this.divCountdown);
        const newDiv = genHtmlAlertCountdown(this.alertData.countdownData);
        this.divCountdown.appendChild(newDiv);
    }

    renderMarquee() {
        this.cleanRender(this.divMarquee);
        if (this.alertData.marqueeData === null) {
            return;
        }
        this.moveToTheEnd(this.divMarquee);
        const newDiv = genHtmlAlertMarquee(
            this.alertData.marqueeData,
            this.screenManagerBase,
        );
        this.divMarquee.appendChild(newDiv);
        newDiv.querySelectorAll('.marquee').forEach((element: any) => {
            if (element.offsetWidth < element.scrollWidth) {
                element.classList.add('moving');
            }
        });
    }

    renderCamera() {
        this.cleanRender(this.divCamera);
        if (this.alertData.cameraData === null) {
            return;
        }
        this.moveToTheEnd(this.divCamera);
        const cameraId = this.alertData.cameraData.id;
        getAndShowMedia({
            id: cameraId,
            container: this.divCamera,
            extraStyle: this.alertData.cameraData.extraStyle,
        }).then((clearTracks) => {
            this.clearCameraTracks = clearTracks ?? (() => {});
        });
    }

    renderAll() {
        this.renderCountdown();
        this.renderMarquee();
        this.renderCamera();
    }

    cleanRender(divContainer: HTMLDivElement) {
        if (divContainer === this.divCamera) {
            this.clearCameraTracks();
            this.clearCameraTracks = () => {};
        }
        const childList = Array.from(divContainer.children);
        childList.forEach((child) => {
            removeAlert(child);
        });
    }

    moveToTheEnd(divContainer: HTMLDivElement) {
        const parent = divContainer.parentElement;
        if (parent !== null) {
            parent.removeChild(divContainer);
            parent.appendChild(divContainer);
        }
    }

    get containerStyle(): CSSProperties {
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${this.screenManagerBase.width}px`,
            height: `${this.screenManagerBase.height}px`,
            overflow: 'hidden',
        };
    }

    static receiveSyncScreen(message: ScreenMessageType) {
        const { screenId } = message;
        const screenOtherManager = this.getInstance(screenId);
        screenOtherManager.receiveSyncScreen(message);
    }

    render() {
        throw new Error('Method not implemented.');
    }

    clear() {
        this.setCameraData(null);
        this.setMarqueeData(null);
        this.setCountdownData(null);
        this.saveAlertData();
    }

    static getInstance(screenId: number) {
        return super.getInstanceBase<ScreenOtherManager>(screenId);
    }
}
