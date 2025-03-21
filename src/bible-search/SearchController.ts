import { BibleInfoType } from '../helper/bible-helpers/BibleDataReader';
import { getBibleLocale } from '../helper/bible-helpers/serverBibleHelpers2';
import { handleError } from '../helper/errorHelpers';
import FileSource from '../helper/FileSource';
import { appApiFetch } from '../helper/networkHelpers';
import { sanitizeSearchingText } from '../lang';
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
CREATE TABLE verse(bookKey TEXT, chapter INTEGER, verse INT, text TEXT, sText TEXT, PRIMARY KEY(bookKey, chapter, verse));
-- CREATE VIRTUAL TABLE words USING spellfix1;
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
    const verseStatement = databaseAdmin.database.prepare(
        'INSERT INTO verse(bookKey, chapter, verse, text, sText) VALUES(?, ?, ?, ?, ?);',
    );
    const locale = await getBibleLocale(bibleKey);
    // const words = new Set<string>();
    for (const [bookKey, book] of Object.entries(jsonData.books)) {
        console.log(`DB: Processing ${bookKey}`);
        for (const [chapterKey, verses] of Object.entries(book)) {
            for (const verse in verses) {
                const sanitizedText = await sanitizeSearchingText(
                    locale,
                    verses[verse],
                );
                verseStatement.run(
                    bookKey,
                    chapterKey,
                    verse,
                    verses[verse] ?? '',
                    sanitizedText ?? verses[verse] ?? '',
                );
                // if (sanitizedText !== null) {
                //     for (const word of sanitizedText.split(' ')) {
                //         words.add(word);
                //     }
                // }
            }
        }
    }
    // TODO: Enable spellfix1 for KHMER, it doesn't work for unicode
    // const spellStatement = databaseAdmin.database.prepare(
    //     'INSERT INTO words(word) VALUES(?);',
    // );
    // console.log(`DB: Adding ${words.size} words`);
    // for (const word of words) {
    //     spellStatement.run(word);
    // }
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
    async doSearch(bibleKey: string, searchData: BibleSearchForType) {
        const { bookKey, isFresh, text } = searchData;
        let { fromLineNumber, toLineNumber } = searchData;
        const locale = await getBibleLocale(bibleKey);
        const sText = (await sanitizeSearchingText(locale, text)) ?? text;
        const sqlBookKey =
            bookKey !== undefined ? ` AND bookKey = '${bookKey}'` : '';
        let sql = `SELECT * FROM verse WHERE sText LIKE '%${sText}%'${sqlBookKey}`;
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
        const foundResult = result.map((item) => {
            const key = `${item.bookKey}.${item.chapter}:${item.verse}`;
            return {
                uniqueKey: crypto.randomUUID(),
                text: `${key}:${item.text}`,
            };
        });
        let maxLineNumber = 0;
        const countResult = this.database.getAll(
            `SELECT COUNT(*) as count FROM verse WHERE text LIKE '%${sText}%'${sqlBookKey};`,
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
            return await this.databaseSearchHandler.doSearch(
                this.bibleKey,
                searchData,
            );
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
