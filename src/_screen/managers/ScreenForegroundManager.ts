import { CSSProperties } from 'react';

import { setSetting } from '../../helper/settingHelpers';
import {
    genHtmlForegroundCountdown,
    genHtmlForegroundMarquee,
    genHtmlForegroundTime,
    getAndShowMedia,
} from '../screenForegroundHelpers';
import { getForegroundDataListOnScreenSetting } from '../screenHelpers';
import { screenManagerSettingNames } from '../../helper/constants';
import ScreenEventHandler from './ScreenEventHandler';
import ScreenManagerBase from './ScreenManagerBase';
import { unlocking } from '../../server/unlockingHelpers';
import {
    ForegroundDataType,
    BasicScreenMessageType,
    ScreenMessageType,
    ForegroundMarqueDataType,
    ForegroundCameraDataType,
    ForegroundCountdownDataType,
    ForegroundTimeDataType,
} from '../screenTypeHelpers';
import {
    checkAreObjectsEqual,
    checkIsItemInArray,
} from '../../server/comparisonHelpers';
import { OptionalPromise } from '../../helper/typeHelpers';

export type ScreenForegroundEventType = 'update';

const containerMapper = new WeakMap<
    object,
    {
        container: HTMLElement;
        removeHandler: () => OptionalPromise<void>;
    }
>();
export default class ScreenForegroundManager extends ScreenEventHandler<ScreenForegroundEventType> {
    static readonly eventNamePrefix: string = 'screen-foreground-m';
    private _div: HTMLDivElement | null = null;
    foregroundData: ForegroundDataType;
    rendererMap: Map<string, (data: any) => void>;
    setterMap: Map<string, (data: any, isNoSyncGroup?: boolean) => void>;

    constructor(screenManagerBase: ScreenManagerBase) {
        super(screenManagerBase);

        const allForegroundDataList = getForegroundDataListOnScreenSetting();
        const foregroundData = allForegroundDataList[this.key] ?? {};
        this.foregroundData = {
            countdownData: foregroundData['countdownData'] ?? null,
            timeDataList: foregroundData['timeDataList'] ?? [],
            marqueeData: foregroundData['marqueeData'] ?? null,
            cameraData: foregroundData['cameraData'] ?? null,
        };
        this.rendererMap = new Map<string, (data: any) => void>([
            ['countdownData', this.renderCountdown.bind(this)],
            ['timeDataList', this.renderTime.bind(this)],
            ['marqueeData', this.renderMarquee.bind(this)],
            ['cameraData', this.renderCamera.bind(this)],
        ]);
        this.setterMap = new Map<
            string,
            (data: any, isNoSyncGroup?: boolean) => void
        >([
            ['countdownData', this.setCountdownData.bind(this)],
            ['timeDataList', this.setTimeDataList.bind(this)],
            ['marqueeData', this.setMarqueeData.bind(this)],
            ['cameraData', this.setCameraData.bind(this)],
        ]);
    }

    get isShowing() {
        return Object.values(this.foregroundData).some((data) => {
            return data !== null;
        });
    }

    get div(): HTMLDivElement {
        return this._div ?? document.createElement('div');
    }

    set div(div: HTMLDivElement | null) {
        this._div = div;
        this.render();
    }

    removeDivContainer(data: any) {
        if (data === null || !containerMapper.has(data)) {
            return;
        }
        const { removeHandler } = containerMapper.get(data)!;
        removeHandler();
    }

    createDivContainer(
        data: any,
        removingHandler?: (container: HTMLElement) => Promise<void> | void,
    ): HTMLElement | null {
        if (data === null) {
            return null;
        }
        this.removeDivContainer(data);
        const container = document.createElement('div');
        containerMapper.set(data, {
            container,
            removeHandler: async () => {
                containerMapper.delete(data);
                await removingHandler?.(container);
                container.parentNode?.removeChild(container);
            },
        });
        this.div.appendChild(container);
        return container;
    }

    compareAndRender(oldData: any, newData: any, render: (data: any) => void) {
        if (oldData === null && newData !== null) {
            render(newData);
            return newData;
        } else if (oldData !== null && newData === null) {
            this.removeDivContainer(oldData);
            return null;
        } else if (!checkAreObjectsEqual(oldData, newData)) {
            this.removeDivContainer(oldData);
            render(newData);
            return newData;
        }
        return oldData;
    }

    saveForegroundData() {
        unlocking(screenManagerSettingNames.FOREGROUND, () => {
            const allForegroundDataList =
                getForegroundDataListOnScreenSetting();
            allForegroundDataList[this.key] = this.foregroundData;
            const string = JSON.stringify(allForegroundDataList);
            setSetting(screenManagerSettingNames.FOREGROUND, string);
            this.fireUpdateEvent();
        });
        this.sendSyncScreen();
    }

    toSyncMessage(): BasicScreenMessageType {
        return {
            type: 'foreground',
            data: this.foregroundData,
        };
    }

    fireUpdateEvent() {
        super.fireUpdateEvent();
        ScreenForegroundManager.fireUpdateEvent();
    }

    static async setData(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        callback: (screenForegroundManager: ScreenForegroundManager) => void,
        isForceChoosing: boolean,
    ) {
        const callbackSave = async (
            screenForegroundManager: ScreenForegroundManager,
        ) => {
            callback(screenForegroundManager);
            screenForegroundManager.saveForegroundData();
        };
        const screenIds = await this.chooseScreenIds(event, isForceChoosing);
        screenIds.forEach((screenId) => {
            callbackSave(this.getInstance(screenId));
        });
    }

    renderCountdown(data: ForegroundCountdownDataType) {
        const { handleAdding, handleRemoving } =
            genHtmlForegroundCountdown(data);
        const divContainer = this.createDivContainer(data, handleRemoving);
        handleAdding(divContainer!);
    }
    setCountdownData(
        data: ForegroundCountdownDataType | null,
        isNoSyncGroup = false,
    ) {
        this.applyForegroundDataWithSyncGroup(
            {
                ...this.foregroundData,
                countdownData: data,
            },
            isNoSyncGroup,
        );
    }
    static async setCountdown(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        dateTime: Date | null,
        extraStyle: CSSProperties = {},
        isForceChoosing = false,
    ) {
        this.setData(
            event,
            (screenForegroundManager) => {
                const countdownData =
                    dateTime !== null ? { dateTime, extraStyle } : null;
                screenForegroundManager.setCountdownData(countdownData);
            },
            isForceChoosing,
        );
    }

    renderTime(dataList: ForegroundTimeDataType[]) {
        for (const oldData of this.foregroundData.timeDataList ?? []) {
            this.removeDivContainer(oldData);
        }
        for (const data of dataList) {
            const { handleAdding, handleRemoving } =
                genHtmlForegroundTime(data);
            const divContainer = this.createDivContainer(data, handleRemoving);
            handleAdding(divContainer!);
        }
    }
    setTimeDataList(
        dataList: ForegroundTimeDataType[] | null,
        isNoSyncGroup = false,
    ) {
        this.applyForegroundDataWithSyncGroup(
            {
                ...this.foregroundData,
                timeDataList: dataList,
            },
            isNoSyncGroup,
        );
    }
    addTimeData(data: ForegroundTimeDataType, isNoSyncGroup = false) {
        if (checkIsItemInArray(data, this.foregroundData.timeDataList)) {
            return;
        }
        const timeDataList = [
            ...(this.foregroundData.timeDataList ?? []),
            data,
        ];
        this.setTimeDataList(timeDataList, isNoSyncGroup);
    }
    removeTimeData(data: ForegroundTimeDataType, isNoSyncGroup = false) {
        const timeDataList = (this.foregroundData.timeDataList ?? []).filter(
            (item) => {
                return !checkAreObjectsEqual(item, data);
            },
        );
        this.setTimeDataList(timeDataList, isNoSyncGroup);
    }
    static async addTimeData(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        timeData: ForegroundTimeDataType,
        isForceChoosing = false,
    ) {
        this.setData(
            event,
            (screenForegroundManager) => {
                screenForegroundManager.addTimeData(timeData);
            },
            isForceChoosing,
        );
    }
    static async removeTimeData(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        timeData: ForegroundTimeDataType,
        isForceChoosing = false,
    ) {
        this.setData(
            event,
            (screenForegroundManager) => {
                screenForegroundManager.removeTimeData(timeData);
            },
            isForceChoosing,
        );
    }

    renderMarquee(data: ForegroundMarqueDataType) {
        const { element, handleRemoving } = genHtmlForegroundMarquee(
            data,
            this.screenManagerBase,
        );
        const divMarquee = this.createDivContainer(data, handleRemoving);
        divMarquee!.appendChild(element);
    }
    setMarqueeData(
        data: ForegroundMarqueDataType | null,
        isNoSyncGroup = false,
    ) {
        this.applyForegroundDataWithSyncGroup(
            {
                ...this.foregroundData,
                marqueeData: data,
            },
            isNoSyncGroup,
        );
    }
    static async setMarquee(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        text: string | null,
        isForceChoosing = false,
    ) {
        this.setData(
            event,
            (screenForegroundManager) => {
                const marqueeData = text !== null ? { text } : null;
                screenForegroundManager.setMarqueeData(marqueeData);
            },
            isForceChoosing,
        );
    }

    renderCamera(data: ForegroundCameraDataType) {
        const store = { clearCameraTracks: () => {} };
        const divMarquee = this.createDivContainer(data, () => {
            store.clearCameraTracks();
        });
        getAndShowMedia({
            container: divMarquee!,
            ...data,
        }).then((clearTracks) => {
            store.clearCameraTracks = clearTracks ?? (() => {});
        });
    }
    setCameraData(
        data: ForegroundCameraDataType | null,
        isNoSyncGroup = false,
    ) {
        this.applyForegroundDataWithSyncGroup(
            {
                ...this.foregroundData,
                cameraData: data,
            },
            isNoSyncGroup,
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
            (screenForegroundManager) => {
                const cameraData = id !== null ? { id, extraStyle } : null;
                screenForegroundManager.setCameraData(cameraData);
            },
            isForceChoosing,
        );
    }

    receiveSyncScreen(message: ScreenMessageType) {
        const data: ForegroundDataType = message.data;
        for (const [key, setter] of this.setterMap.entries()) {
            setter(data[key as keyof ForegroundDataType] ?? null, true);
        }
        this.fireUpdateEvent();
    }

    render() {
        for (const [key, render] of this.rendererMap.entries()) {
            const data = this.foregroundData[key as keyof ForegroundDataType];
            if (data !== null) {
                render(data);
            }
        }
    }

    applyForegroundDataWithSyncGroup(
        newForegroundData: ForegroundDataType,
        isNoSyncGroup = false,
    ) {
        if (this.screenManagerBase.checkIsLockedWithMessage()) {
            return;
        }
        if (!isNoSyncGroup) {
            ScreenForegroundManager.enableSyncGroup(this.screenId);
        }
        for (const item of Object.entries(this.foregroundData)) {
            const key = item[0];
            let oldData = item[1];
            const render = this.rendererMap.get(key) ?? null;
            if (render === null) {
                continue;
            }
            oldData = this.compareAndRender(
                oldData,
                newForegroundData[key as keyof ForegroundDataType] ?? null,
                render,
            );
            Object.assign(this.foregroundData, {
                [key as keyof ForegroundDataType]: oldData,
            });
        }
        this.saveForegroundData();
    }

    clear() {
        this.applyForegroundDataWithSyncGroup(
            Object.fromEntries(
                Object.keys(this.foregroundData).map((key) => [key, null]),
            ) as ForegroundDataType,
            true,
        );
        this.div.innerHTML = '';
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
        const screenForegroundManager = this.getInstance(screenId);
        screenForegroundManager.receiveSyncScreen(message);
    }

    static getInstance(screenId: number) {
        return super.getInstanceBase<ScreenForegroundManager>(screenId);
    }
}
