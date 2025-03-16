import HandleAlertComp from './popup-widget/HandleAlertComp';
import AppReaderComp from './AppReaderComp';
import AppContextMenuComp from './others/AppContextMenuComp';
import TopProgressBarComp from './progress-bar/TopProgressBarComp';
import ToastComp from './toast/ToastComp';
import { main } from './appInitHelpers';
import appProvider from './server/appProvider';
import { bibleDataReader } from './helper/bible-helpers/BibleDataReader';

import { downloadFile } from './helper/helpers';

import wins64Fts5Url from './assets/db-exts/fts5.dll?url';
import winsI386Fts5Url from './assets/db-exts/fts5-i386.dll?url';
import macArm64Fts5Url from './assets/db-exts/fts5.dylib?url';
import macIntelFts5Url from './assets/db-exts/fts5-int.dylib?url';
import linux64Fts5Url from './assets/db-exts/fts5.so?url';
import linuxI386Fts5Url from './assets/db-exts/fts5-i386.so?url';
import linuxSpellfix1Url from './assets/db-exts/spellfix1.so?url';
import { getUserWritablePath } from './server/appHelpers';

const destinationPath = getUserWritablePath();

async function getDB() {
    let fts5Url = '';
    const systemUtils = appProvider.systemUtils;
    if (systemUtils.isWindows) {
        fts5Url = systemUtils.is64System ? wins64Fts5Url : winsI386Fts5Url;
    } else if (systemUtils.isMac) {
        fts5Url = systemUtils.isArm64 ? macArm64Fts5Url : macIntelFts5Url;
    } else if (systemUtils.isLinux) {
        fts5Url = systemUtils.is64System ? linux64Fts5Url : linuxI386Fts5Url;
    } else {
        throw new Error('Unsupported OS');
    }
    const extFilePath = await downloadFile(
        fts5Url,
        'fts5',
        'application/x-msdownload',
        destinationPath,
        true,
    );
    const extSpellfixFilePath = await downloadFile(
        linuxSpellfix1Url,
        'spellfix1',
        'application/x-msdownload',
        destinationPath,
        true,
    );
    const biblePath = await bibleDataReader.getWritableBiblePath();
    const db = appProvider.dbUtils.getSQLiteDBInstance(
        `${biblePath}/test.db`,
        extFilePath,
    );
    db.db.loadExtension(extSpellfixFilePath);
    return db;
}

(window as any).dbUtils = {
    ...appProvider.dbUtils,
    create: async () => {
        const db = await getDB();
        db.exec(`
-- Create a json table.
CREATE VIRTUAL TABLE IF NOT EXISTS demo USING spellfix1;
-- Create a json table.
CREATE TABLE IF NOT EXISTS json_table(key TEXT PRIMARY KEY, verses JSON);
-- Create a table. And an external content fts5 table to index it.
CREATE TABLE IF NOT EXISTS t1(a VARCHAR(7) PRIMARY KEY, b TEXT);
CREATE VIRTUAL TABLE IF NOT EXISTS fts_idx USING fts5(b, content='t1', content_rowid='a');

-- Triggers to keep the FTS index up to date.
CREATE TRIGGER IF NOT EXISTS t1_ai AFTER INSERT ON t1 BEGIN
  INSERT INTO fts_idx(rowid, b) VALUES (new.a, new.b);
END;
CREATE TRIGGER IF NOT EXISTS t1_ad AFTER DELETE ON t1 BEGIN
  INSERT INTO fts_idx(fts_idx, rowid, b) VALUES('delete', old.a, old.b);
END;
CREATE TRIGGER IF NOT EXISTS t1_au AFTER UPDATE ON t1 BEGIN
  INSERT INTO fts_idx(fts_idx, rowid, b) VALUES('delete', old.a, old.b);
  INSERT INTO fts_idx(rowid, b) VALUES (new.a, new.b);
END;
`);
        db.close();
    },
    insert: async () => {
        const db = await getDB();
        db.exec(`
INSERT INTO t1 VALUES('1', 'all that glitters');
INSERT INTO t1 VALUES('2', 'is not gold');
`);
        db.close();
    },
    insertJson: async () => {
        const db = await getDB();
        db.exec(`
INSERT INTO json_table VALUES('GEN 1', '{"verse": 1, "text": "In the beginning God created..."}');
`);
        db.close();
    },
    find: async () => {
        const db = await getDB();
        const result = db.getAll(`
SELECT * FROM fts_idx WHERE b MATCH 'glitters';
`);
        db.close();
        return result;
    },
    findJson: async () => {
        const db = await getDB();
        const result = db.getAll(`
-- where verses.verse = 1
SELECT * FROM json_table, json_tree(json_table.verses) WHERE json_tree.value = 1;
`);
        db.close();
        return result;
    },
};

main(
    <>
        <AppReaderComp />
        <TopProgressBarComp />
        <ToastComp />
        <AppContextMenuComp />
        <HandleAlertComp />
    </>,
);
