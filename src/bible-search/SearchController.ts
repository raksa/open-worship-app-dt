import { BibleInfoType } from '../helper/bible-helpers/BibleDataReader';
import { handleError } from '../helper/errorHelpers';
import FileSource from '../helper/FileSource';
import { appApiFetch } from '../helper/networkHelpers';
import appProvider, { SQLiteDatabaseType } from '../server/appProvider';
import { fsCheckFileExist, pathJoin } from '../server/fileHelpers';
import { getBibleXMLDataFromKey } from '../setting/bible-setting/bibleXMLHelpers';
import { getAllXMLFileKeys } from '../setting/bible-setting/bibleXMLJsonDataHelpers';
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

async function initDatabase(bibleKey: string, databaseFilePath: string) {
    const databaseUtils = appProvider.databaseUtils;
    const databaseAdmin =
        databaseUtils.getSQLiteDatabaseInstance(databaseFilePath);
    databaseAdmin.exec(`
CREATE TABLE info(key TEXT PRIMARY KEY, info JSON);
CREATE TABLE chapters(key TEXT PRIMARY KEY, verses JSON);
CREATE TABLE verses(key TEXT PRIMARY KEY, text TEXT);
CREATE VIRTUAL TABLE v_idx USING fts5(key, text);
`);
    const jsonData = await getBibleXMLDataFromKey(bibleKey);
    if (jsonData === null) {
        return null;
    }
    const bibleInfo = jsonData.info;
    const infoStringified = JSON.stringify({
        ...bibleInfo,
        books: bibleInfo.booksMap,
        numList: Array.from(
            {
                length: 10,
            },
            (_, i) => bibleInfo.numbersMap?.[i],
        ),
    } as BibleInfoType);
    databaseAdmin.exec(
        `INSERT INTO info VALUES('info', '${infoStringified}');`,
    );
    const chapterStatement = databaseAdmin.database.prepare(
        'INSERT INTO chapters VALUES(?, ?);',
    );
    const verseStatement = databaseAdmin.database.prepare(
        'INSERT INTO v_idx VALUES(?, ?);',
    );
    for (const [bookKey, book] of Object.entries(jsonData.books)) {
        const bookName = bibleInfo.booksMap[bookKey];
        for (const [chapterKey, verses] of Object.entries(book)) {
            chapterStatement.run(
                `${bookName} ${chapterKey}`,
                JSON.stringify({
                    verses,
                }),
            );
            for (const [verseKey, text] of Object.entries(verses)) {
                verseStatement.run(
                    `${bookName} ${chapterKey}:${verseKey}`,
                    text,
                );
            }
        }
    }
    return databaseAdmin;
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

class DatabaseSearchHandler {
    database: SQLiteDatabaseType;
    constructor(database: SQLiteDatabaseType) {
        this.database = database;
    }
    async doSearch(searchData: BibleSearchForType) {
        const { text } = searchData;
        const result = this.database.getAll(
            `SELECT * FROM v_idx WHERE text MATCH '${text}';`,
        );
        console.log(result);
        return null;
    }
}

export default class SearchController {
    onlineSearchHandler: OnlineSearchHandler | null = null;
    databaseSearchHandler: DatabaseSearchHandler | null = null;
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
        if (this.bookKey !== null) {
            searchData['bookKey'] = this.bookKey;
        }
        if (this.onlineSearchHandler !== null) {
            return await this.onlineSearchHandler.doSearch(searchData);
        }
        if (this.databaseSearchHandler !== null) {
            return await this.databaseSearchHandler.doSearch(searchData);
        }
        return null;
    }

    static async getOnlineInstant(instance: SearchController) {
        const apiData = await loadApiData();
        if (apiData === null) {
            return null;
        }
        const apiDataMap = apiData.mapper[instance.bibleKey];
        if (apiDataMap === undefined) {
            return null;
        }
        instance.onlineSearchHandler = new OnlineSearchHandler(apiDataMap);
        return instance;
    }

    static async getXMLInstant(
        instance: SearchController,
        xmlFilePath: string,
    ) {
        const fileSource = FileSource.getInstance(xmlFilePath);
        const databasePath = pathJoin(
            fileSource.basePath,
            `${fileSource.name}.db`,
        );
        let database: SQLiteDatabaseType | null = null;
        if (!(await fsCheckFileExist(databasePath))) {
            database = await initDatabase(instance.bibleKey, databasePath);
        } else {
            const databaseUtils = appProvider.databaseUtils;
            database = databaseUtils.getSQLiteDatabaseInstance(databasePath);
        }
        if (database === null) {
            return null;
        }
        instance.databaseSearchHandler = new DatabaseSearchHandler(database);
        return instance;
    }

    static async getInstant(bibleKey: string) {
        const instance = new SearchController(bibleKey);
        const keysMap = await getAllXMLFileKeys();
        if (keysMap[bibleKey] === undefined) {
            return await SearchController.getOnlineInstant(instance);
        }
        return await SearchController.getXMLInstant(
            instance,
            keysMap[bibleKey],
        );
    }
}
