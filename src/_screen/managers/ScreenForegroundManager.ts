import { CSSProperties } from 'react';

import { setSetting } from '../../helper/settingHelpers';
import {
    genHtmlForegroundCountdown,
    genHtmlForegroundMarquee,
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
} from '../screenTypeHelpers';
import { checkAreObjectsEqual } from '../../server/comparisonHelpers';

export type ScreenForegroundEventType = 'update';

const containerMapper = new WeakMap<
    object,
    {
        container: HTMLElement;
        removeHandler: () => void;
    }
>();
export default class ScreenForegroundManager extends ScreenEventHandler<ScreenForegroundEventType> {
    static readonly eventNamePrefix: string = 'screen-foreground-m';
    private _div: HTMLDivElement | null = null;
    foregroundData: ForegroundDataType;
    rendererMap: Map<string, (data: any) => void>;

    constructor(screenManagerBase: ScreenManagerBase) {
        super(screenManagerBase);
        const allForegroundDataList = getForegroundDataListOnScreenSetting();
        const foregroundData = allForegroundDataList[this.key] ?? {};
        this.foregroundData = {
            countdownData: foregroundData['countdownData'] ?? null,
            marqueeData: foregroundData['marqueeData'] ?? null,
            cameraData: foregroundData['cameraData'] ?? null,
        };
        this.rendererMap = new Map<string, (data: any) => void>([
            ['countdownData', this.renderCountdown.bind(this)],
            ['marqueeData', this.renderMarquee.bind(this)],
            ['cameraData', this.renderCamera.bind(this)],
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
                if (removingHandler !== undefined) {
                    await removingHandler(container);
                }
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            },
        });
        // TODO: apply with transition
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

    applyForegroundDataWithSyncGroup(
        { countdownData, marqueeData, cameraData }: ForegroundDataType,
        isNoSyncGroup = false,
    ) {
        if (this.screenManagerBase.checkIsLockedWithMessage()) {
            return;
        }
        if (!isNoSyncGroup) {
            ScreenForegroundManager.enableSyncGroup(this.screenId);
        }
        const {
            countdownData: oldCountdownData,
            marqueeData: oldMarqueeData,
            cameraData: oldCameraData,
        } = this.foregroundData;
        countdownData = this.compareAndRender(
            oldCountdownData,
            countdownData,
            this.renderCountdown.bind(this),
        );
        marqueeData = this.compareAndRender(
            oldMarqueeData,
            marqueeData,
            this.renderMarquee.bind(this),
        );
        cameraData = this.compareAndRender(
            oldCameraData,
            cameraData,
            this.renderCamera.bind(this),
        );
        Object.assign(this.foregroundData, {
            countdownData,
            marqueeData,
            cameraData,
        });
        this.saveForegroundData();
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

    setCountdownData(
        countdownData: ForegroundCountdownDataType | null,
        isNoSyncGroup = false,
    ) {
        this.applyForegroundDataWithSyncGroup(
            {
                ...this.foregroundData,
                countdownData,
            },
            isNoSyncGroup,
        );
    }

    setMarqueeData(
        marqueeData: ForegroundMarqueDataType | null,
        isNoSyncGroup = false,
    ) {
        this.applyForegroundDataWithSyncGroup(
            {
                ...this.foregroundData,
                marqueeData,
            },
            isNoSyncGroup,
        );
    }

    setCameraData(
        cameraData: ForegroundCameraDataType | null,
        isNoSyncGroup = false,
    ) {
        this.applyForegroundDataWithSyncGroup(
            {
                ...this.foregroundData,
                cameraData,
            },
            isNoSyncGroup,
        );
    }

    receiveSyncScreen(message: ScreenMessageType) {
        const data: ForegroundDataType = message.data;
        this.setCountdownData(data.countdownData, true);
        this.setMarqueeData(data.marqueeData, true);
        this.setCameraData(data.cameraData, true);
        this.fireUpdateEvent();
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

    renderCountdown(data: ForegroundCountdownDataType) {
        const { element, handleRemoving } = genHtmlForegroundCountdown(data);
        const divCountdown = this.createDivContainer(data, handleRemoving);
        divCountdown!.appendChild(element);
    }

    renderMarquee(data: ForegroundMarqueDataType) {
        const { element, handleRemoving } = genHtmlForegroundMarquee(
            data,
            this.screenManagerBase,
        );
        const divMarquee = this.createDivContainer(data, handleRemoving);
        divMarquee!.appendChild(element);
    }

    renderCamera(data: ForegroundCameraDataType) {
        const store = { clearCameraTracks: () => {} };
        const divMarquee = this.createDivContainer(data, () => {
            store.clearCameraTracks();
        });
        getAndShowMedia({
            id: data.id,
            container: divMarquee!,
            extraStyle: data.extraStyle,
        }).then((clearTracks) => {
            store.clearCameraTracks = clearTracks ?? (() => {});
        });
    }

    render() {
        for (const [key, render] of this.rendererMap.entries()) {
            const data = this.foregroundData[key as keyof ForegroundDataType];
            if (data !== null) {
                render(data);
            }
        }
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
