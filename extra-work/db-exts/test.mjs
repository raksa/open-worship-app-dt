import { DatabaseSync } from 'node:sqlite';
import { join, resolve } from 'node:path';
import console from 'node:console';
import { existsSync, unlinkSync } from 'node:fs';

const __dirname = import.meta.dirname;

const extBasePath = resolve(__dirname);
const dbFilePath = join(extBasePath, 'test.db');
if (existsSync(dbFilePath)) {
  unlinkSync(dbFilePath);
}
const db = new DatabaseSync(join(extBasePath, 'test.db'), {
  allowExtension: true,
});
db.loadExtension(join(extBasePath, 'fts5.dylib'));
db.loadExtension(join(extBasePath, 'spellfix1.dylib'));
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
db.exec(`
INSERT INTO t1 VALUES('1', 'all that glitters');
INSERT INTO t1 VALUES('2', 'is not gold');
INSERT INTO json_table VALUES('GEN 1', '{"verse": 1, "text": "In the beginning God created..."}');
`);
let query = db.prepare(`
SELECT * FROM fts_idx WHERE b MATCH 'glitters';
`);
console.log(query.all());
query = db.prepare(`
SELECT * FROM json_table, json_tree(json_table.verses) WHERE json_tree.value = 1;
`);
console.log(query.all());
