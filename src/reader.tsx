import HandleAlertComp from './popup-widget/HandleAlertComp';
import AppReaderComp from './AppReaderComp';
import AppContextMenuComp from './others/AppContextMenuComp';
import TopProgressBarComp from './progress-bar/TopProgressBarComp';
import ToastComp from './toast/ToastComp';
import { main } from './appInitHelpers';
import appProvider from './server/appProvider';

(window as any).dbUtils = {
    ...appProvider.dbUtils,
    create: () => {
        const db = appProvider.dbUtils.getSQLiteDBInstance('test');
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
    },
    insert: () => {
        const db = appProvider.dbUtils.getSQLiteDBInstance('test');
        db.exec(`
INSERT INTO t1 VALUES('1', 'all that glitters');
INSERT INTO t1 VALUES('2', 'is not gold');
`);
    },
    find: () => {
        const db = appProvider.dbUtils.getSQLiteDBInstance('test');
        return db.getAll(`
SELECT * FROM fts_idx WHERE b MATCH 'glitters';
`);
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
