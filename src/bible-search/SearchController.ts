import { handleError } from '../helper/errorHelpers';
import { appApiFetch } from '../helper/networkHelpers';
import { SQLiteDatabaseType } from '../server/appProvider';
import {
    APIDataMapType,
    APIDataType,
    BibleSearchForType,
    searchOnline,
} from './bibleSearchHelpers';

async function loadApiData() {
    try {
        const content = await appApiFetch('bible-online-info.json');
        const json = await content.json();
        if (typeof json.mapper !== 'object') {
            throw new Error('Cannot get bible list');
        }
        return json as APIDataType;
    } catch (error) {
        handleError(error);
    }
    return null;
}

class OnlineSearchHandler {
    apiDataMap: APIDataMapType;
    constructor(apiDataMap: APIDataMapType) {
        this.apiDataMap = apiDataMap;
    }
    async doSearch(searchData: BibleSearchForType) {
        const data = await searchOnline(
            this.apiDataMap.apiUrl,
            this.apiDataMap.apiKey,
            searchData,
        );
        return data;
    }
}

class LocalSearchHandler {
    db: SQLiteDatabaseType;
    constructor(db: SQLiteDatabaseType) {
        this.db = db;
    }
    // TODO
    async doSearch(_searchData: BibleSearchForType) {
        return null;
    }
}

export default class SearchController {
    onlineSearchHandler: OnlineSearchHandler | null = null;
    localSearchHandler: LocalSearchHandler | null = null;
    private readonly _bibleKey: string;
    private _bookKey: string | null = null;
    constructor(bibleKey: string) {
        this._bibleKey = bibleKey;
    }

    get bookKey() {
        return this._bookKey;
    }
    set bookKey(value: string | null) {
        this._bookKey = value;
    }

    get bibleKey() {
        return this._bibleKey;
    }

    async doSearch(searchData: BibleSearchForType) {
        if (this._bookKey !== null) {
            searchData['bookKey'] = this._bookKey;
        }
        if (this.onlineSearchHandler !== null) {
            return await this.onlineSearchHandler.doSearch(searchData);
        }
        if (this.localSearchHandler !== null) {
            return await this.localSearchHandler.doSearch(searchData);
        }
        return null;
    }

    static async getInstant(bibleKey: string) {
        const apiData = await loadApiData();
        if (apiData === null) {
            return null;
        }
        const apiDataMap = apiData.mapper[bibleKey];
        if (apiDataMap === undefined) {
            return null;
        }
        const instance = new SearchController(bibleKey);
        instance.onlineSearchHandler = new OnlineSearchHandler(apiDataMap);
        return instance;
    }
}
