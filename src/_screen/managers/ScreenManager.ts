import { DragTypeEnum, DroppedDataType } from '../../helper/DragInf';
import { log } from '../../helper/loggerHelpers';
import ScreenAlertManager from './ScreenAlertManager';
import ScreenBackgroundManager from './ScreenBackgroundManager';
import ScreenFullTextManager from './ScreenFullTextManager';
import ScreenSlideManager from './ScreenSlideManager';
import ScreenEffectManager from './ScreenEffectManager';
import { deleteScreenManagerBaseCache } from './screenManagerBaseHelpers';
import ScreenManagerBase from './ScreenManagerBase';
import { RegisteredEventType } from '../../event/EventHandler';
import { saveScreenManagersSetting } from './screenManagerHelpers';

export type ScreenManagerEventType = (
    'instance' | 'update' | 'visible' | 'display-id' | 'resize'
);

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
            ...this.screenBackgroundManager.registerEventListener(
                ['update'], () => {
                    if (this.screenBackgroundManager.isShowing) {
                        this.screenSlideManager.clear();
                    }
                },
            ),
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
        await saveScreenManagersSetting(this.screenId);
        this.fireInstanceEvent();
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
}
