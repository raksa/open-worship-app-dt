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
import wins86Fts5Url from './assets/db-exts/x86_fts5.dll?url';
import macArm64Fts5Url from './assets/db-exts/fts5.dylib?url';
import macIntelFts5Url from './assets/db-exts/int_fts5.dylib?url';

async function getDB() {
    let fts5Url = '';
    const systemUtils = appProvider.systemUtils;
    if (systemUtils.isWindows) {
        fts5Url = systemUtils.is64System ? wins64Fts5Url : wins86Fts5Url;
    } else if (systemUtils.isMac) {
        fts5Url = systemUtils.isArm64 ? macArm64Fts5Url : macIntelFts5Url;
    } else {
        throw new Error('Unsupported OS');
    }
    const dllFilePath = await downloadFile(
        fts5Url,
        'fts5.dll',
        'application/x-msdownload',
        true,
    );
    const biblePath = await bibleDataReader.getWritableBiblePath();
    const db = appProvider.dbUtils.getSQLiteDBInstance(
        `${biblePath}/test.db`,
        dllFilePath,
    );
    return db;
}

(window as any).dbUtils = {
    ...appProvider.dbUtils,
    create: async () => {
        const db = await getDB();
        db.exec(`
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
    find: async () => {
        const db = await getDB();
        const result = db.getAll(`
SELECT * FROM fts_idx WHERE b MATCH 'glitters';
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
