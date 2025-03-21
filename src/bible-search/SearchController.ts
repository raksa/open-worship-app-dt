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
    BibleSearchResultType,
    searchOnline,
} from './bibleSearchHelpers';

const DEFAULT_ROW_LIMIT = 20;

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
CREATE VIRTUAL TABLE c_idx USING fts5(bookKey, text);
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
    const vChapterStatement = databaseAdmin.database.prepare(
        'INSERT INTO c_idx VALUES(?, ?);',
    );
    for (const [bookKey, book] of Object.entries(jsonData.books)) {
        for (const [chapterKey, verses] of Object.entries(book)) {
            const verseList = Object.keys(verses).map((item) => parseInt(item));
            const startVerse = Math.min(...verseList);
            const endVerse = Math.max(...verseList);
            chapterStatement.run(
                `${bookKey}.${chapterKey}:${startVerse}-${endVerse}`,
                JSON.stringify({
                    verses,
                }),
            );
            const text = Object.values(verses)
                .join(' ')
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, ' ')
                .replace(/\s+/g, ' ');
            vChapterStatement.run(bookKey, text);
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
        const { bookKey, isFresh } = searchData;
        let { text, fromLineNumber, toLineNumber } = searchData;
        text = text
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, ' ')
            .replace(/\s+/g, ' ');
        let sql = `SELECT rowid, text FROM c_idx WHERE text MATCH '${text}'`;
        if (bookKey !== undefined) {
            sql += ` AND bookKey = '${bookKey}'`;
        }
        if (fromLineNumber == undefined || toLineNumber == undefined) {
            fromLineNumber = 1;
            toLineNumber = DEFAULT_ROW_LIMIT;
        }
        const count = toLineNumber - fromLineNumber + 1;
        if (count < 1) {
            throw new Error(
                `Invalid line number ${JSON.stringify(searchData)}`,
            );
        }
        sql += ` LIMIT ${fromLineNumber}, ${count}`;
        const result = this.database.getAll(`${sql};`);
        const rowidList = result.map((item) => item.rowid);
        const chapters = this.database.getAll(
            `SELECT rowid, key FROM chapters WHERE rowid IN (${rowidList.join(',')});`,
        );
        const chapterMap = new Map(
            chapters.map((item) => {
                return [item.rowid, item.key];
            }),
        );
        const foundResult = result.map((item) => {
            const chapterKey = chapterMap.get(item.rowid);
            if (chapterKey === undefined) {
                throw new Error(
                    'Cannot find chapter key row id: ' + item.rowid,
                );
            }
            return {
                uniqueKey: crypto.randomUUID(),
                text: `${chapterKey}::${item.text}`,
            };
        });
        let maxLineNumber = 0;
        const countResult = this.database.getAll(
            `SELECT COUNT(*) as count FROM c_idx WHERE text MATCH '${text}'`,
        );
        if (countResult.length > 0) {
            maxLineNumber = countResult[0].count;
        }
        return {
            maxLineNumber,
            fromLineNumber,
            toLineNumber,
            content: foundResult,
            isFresh,
        } as BibleSearchResultType;
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
