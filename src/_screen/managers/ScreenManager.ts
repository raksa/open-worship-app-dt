import { DragTypeEnum, DroppedDataType } from '../../helper/DragInf';
import { log } from '../../helper/loggerHelpers';
import ScreenAlertManager from './ScreenAlertManager';
import ScreenBackgroundManager from './ScreenBackgroundManager';
import ScreenFullTextManager from './ScreenFullTextManager';
import ScreenSlideManager from './ScreenSlideManager';
import ScreenEffectManager from './ScreenEffectManager';
import {
    deleteScreenManagerBaseCache, getAllScreenManagerBases,
    getScreenManagerBase,
} from './screenManagerBaseHelpers';
import ScreenManagerBase from './ScreenManagerBase';
import { RegisteredEventType } from '../../event/EventHandler';
import appProviderScreen from '../appProviderScreen';
import { ScreenMessageType } from '../screenHelpers';

export default class ScreenManager extends ScreenManagerBase {

    readonly screenBackgroundManager: ScreenBackgroundManager;
    readonly screenSlideManager: ScreenSlideManager;
    readonly screenFullTextManager: ScreenFullTextManager;
    readonly screenAlertManager: ScreenAlertManager;
    readonly slideEffectManager: ScreenEffectManager;
    readonly backgroundEffectManager: ScreenEffectManager;
    private readonly registeredEventListeners: RegisteredEventType<any, any>[];


    constructor(screenId: number) {
        super(screenId);
        this.slideEffectManager = new ScreenEffectManager(this, 'slide');
        this.backgroundEffectManager = new ScreenEffectManager(
            this, 'background',
        );
        this.screenBackgroundManager = new ScreenBackgroundManager(
            this, this.backgroundEffectManager,
        );
        this.screenSlideManager = new ScreenSlideManager(
            this, this.slideEffectManager,
        );
        this.screenFullTextManager = new ScreenFullTextManager(this);
        this.screenAlertManager = new ScreenAlertManager(this);
        this.registeredEventListeners = [];
        this.registeredEventListeners.push(
            ...this.screenSlideManager.registerEventListener(['update'], () => {
                if (this.screenSlideManager.isShowing) {
                    this.screenFullTextManager.clear();
                }
            }),
            ...this.screenFullTextManager.registerEventListener(
                ['update'], () => {
                    if (this.screenFullTextManager.isShowing) {
                        this.screenSlideManager.clear();
                    }
                },
            )
        );
    }

    sendSyncScreen() {
        ScreenFullTextManager.sendSynTextStyle();
        this.backgroundEffectManager.sendSyncScreen();
        this.screenBackgroundManager.sendSyncScreen();
        this.screenAlertManager.sendSyncScreen();
        this.screenSlideManager.sendSyncScreen();
        this.slideEffectManager.sendSyncScreen();
        this.screenFullTextManager.sendSyncScreen();
    }

    clear() {
        this.screenFullTextManager.clear();
        this.screenSlideManager.clear();
        this.screenAlertManager.clear();
        this.screenBackgroundManager.clear();
        this.fireUpdateEvent();
    }

    async delete() {
        this.isDeleted = true;
        this.registeredEventListeners.forEach(({ eventName, listener }) => {
            this.removeOnEventListener(eventName, listener);
        });
        this.clear();
        this.hide();
        this.slideEffectManager.delete();
        this.backgroundEffectManager.delete();
        this.screenBackgroundManager.delete();
        this.screenSlideManager.delete();
        this.screenFullTextManager.delete();
        this.screenAlertManager.delete();
        deleteScreenManagerBaseCache(this.key);
    }

    receiveScreenDropped(droppedData: DroppedDataType) {
        if ([
            DragTypeEnum.BACKGROUND_COLOR,
            DragTypeEnum.BACKGROUND_IMAGE,
            DragTypeEnum.BACKGROUND_VIDEO,
        ].includes(droppedData.type)) {
            this.screenBackgroundManager.receiveScreenDropped(droppedData);
        } else if (droppedData.type === DragTypeEnum.SLIDE_ITEM) {
            this.screenSlideManager.receiveScreenDropped(droppedData);
        } else if ([
            DragTypeEnum.BIBLE_ITEM,
            DragTypeEnum.LYRIC_ITEM,
        ].includes(droppedData.type)) {
            this.screenFullTextManager.receiveScreenDropped(droppedData);
        } else {
            log(droppedData);
        }
    }


    static getSyncGroupScreenEventHandler(message: ScreenMessageType) {
        const { type } = message;
        if (type === 'background') {
            return ScreenBackgroundManager;
        } else if (type === 'slide') {
            return ScreenSlideManager;
        } else if (type === 'full-text') {
            return ScreenFullTextManager;
        } else if (type === 'alert') {
            return ScreenAlertManager;
        }
        return null;
    }

    static applyScreenManagerSyncScreen(message: ScreenMessageType) {
        const ScreenHandler = this.getSyncGroupScreenEventHandler(message);
        if (ScreenHandler !== null) {
            return ScreenHandler.receiveSyncScreen(message);
        }
        const { type, data, screenId } = message;
        const screenManagerBase = getScreenManagerBase(screenId);
        if (screenManagerBase === null) {
            return;
        }
        if (type === 'init') {
            screenManagerBase.sendSyncScreen();
        } else if (type === 'visible') {
            screenManagerBase.isShowing = data?.isShowing;
        } else if (type === 'effect') {
            ScreenEffectManager.receiveSyncScreen(message);
        } else if (type === 'full-text-scroll') {
            ScreenFullTextManager.receiveSyncScroll(message);
        } else if (type === 'full-text-selected-index') {
            ScreenFullTextManager.receiveSyncSelectedIndex(message);
        } else if (type === 'full-text-text-style') {
            ScreenFullTextManager.receiveSyncTextStyle(message);
        } else {
            log(message);
        }
    }

    static initReceiveScreenMessage() {
        const messageUtils = appProviderScreen.messageUtils;
        const channel = messageUtils.channels.screenMessageChannel;
        messageUtils.listenForData(channel, (_, message: ScreenMessageType) => {
            this.applyScreenManagerSyncScreen(message);
        });
    }

    static async getAllScreenManagersByColorNote(
        colorNote: string | null, excludeScreenIds: number[] = [],
    ): Promise<ScreenManagerBase[]> {
        if (colorNote === null) {
            return [];
        }
        const allScreenManagers = getAllScreenManagerBases();
        const instances: ScreenManagerBase[] = [];
        for (const screenManager of allScreenManagers) {
            if (excludeScreenIds.includes(screenManager.screenId)) {
                continue;
            }
            const note = await screenManager.getColorNote();
            if (note === colorNote) {
                instances.push(screenManager);
            }
        }
        return instances;
    }

    static async syncScreenManagerGroup(message: ScreenMessageType) {
        const currentScreenManager = getScreenManagerBase(
            message.screenId,
        );
        if (currentScreenManager === null || currentScreenManager.isDeleted) {
            return;
        }
        const colorNote = await currentScreenManager.getColorNote();
        const screenManagers = await this.getAllScreenManagersByColorNote(
            colorNote, [currentScreenManager.screenId],
        );
        screenManagers.forEach((screenManagerBase) => {
            const newMessage: ScreenMessageType = {
                ...message,
                screenId: screenManagerBase.screenId,
            };
            const ScreenHandler = this.getSyncGroupScreenEventHandler(
                newMessage,
            );
            if (ScreenHandler !== null) {
                if (!currentScreenManager.checkIsSyncGroupEnabled(
                    ScreenHandler,
                )) {
                    return;
                }
                screenManagerBase.noSyncGroupMap.set(
                    ScreenHandler.eventNamePrefix, true,
                );
                ScreenHandler.receiveSyncScreen(newMessage);
            }
        });
    }

    sendScreenMessage(
        message: ScreenMessageType, isForce?: boolean,
    ) {
        if (appProviderScreen.isScreen && !isForce) {
            return;
        }
        const messageUtils = appProviderScreen.messageUtils;
        const channel = messageUtils.channels.screenMessageChannel;
        const isSent = messageUtils.sendDataSync(channel, {
            ...message,
            isScreen: appProviderScreen.isScreen,
        });
        console.assert(isSent, JSON.stringify({ channel, message }));
        ScreenManager.syncScreenManagerGroup(message);
    }

    createScreenManagerBaseGhost(screenId: number) {
        const ghostScreenManager = new ScreenManager(screenId);
        ghostScreenManager.isDeleted = true;
        return ghostScreenManager;
    }

    getScreenManagerBaseForce(screenId: number) {
        const screenManagerBase = getScreenManagerBase(screenId);
        if (
            screenManagerBase === null ||
            !(screenManagerBase instanceof ScreenManager)
        ) {
            return this.createScreenManagerBaseGhost(screenId);
        }
        return screenManagerBase;
    }

}
