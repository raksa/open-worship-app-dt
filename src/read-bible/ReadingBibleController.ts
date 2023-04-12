import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { getSetting } from '../helper/settingHelper';

export type ReadingBibleEventType = 'reload' | 'font-size-change';
const bibleItemSettingName = 'reading-bible';
const fontSizeSettingName = 'reading-bible-font-size';

export default class ReadingBibleController extends
    EventHandler<ReadingBibleEventType>
{
    static _instance: ReadingBibleController | null = null;
    constructor() {
        super();
    }
    get fontSize() {
        const fontSizeStr = getSetting(fontSizeSettingName, '20');
        return parseInt(fontSizeStr);
    }
    set fontSize(value: number) {
        getSetting(fontSizeSettingName, value.toString());
        this.fireFontSizeChange();
    }
    get bibleItems(): BibleItem[][] {
        try {
            const str = getSetting(bibleItemSettingName, '[]');
            const json = JSON.parse(str);
            return json.map((item: any) => {
                return item.map((item: any) => {
                    return BibleItem.fromJson(item);
                });
            });
        } catch (error) {
            return [];
        }
    }
    set bibleItems(value: BibleItem[][]) {
        const json = value.map((item) => {
            return item.map((item) => {
                return item.toJson();
            });
        });
        const str = JSON.stringify(json);
        getSetting(bibleItemSettingName, str);
        this.fireReloadEvent();
    }
    fireReloadEvent() {
        this.addPropEvent('reload');
    }
    fireFontSizeChange() {
        this.addPropEvent('font-size-change');
    }
    static getInstance(): ReadingBibleController {
        if (!ReadingBibleController._instance) {
            ReadingBibleController._instance = new ReadingBibleController();
        }
        return ReadingBibleController._instance;
    }
}
