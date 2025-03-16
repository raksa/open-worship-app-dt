import { join, resolve } from 'node:path';

// https://nodejs.org/docs/latest-v22.x/api/sqlite.html

class SQLiteDatabase {
    public db: any;
    constructor(dbPath: string) {
        const { DatabaseSync } = require('node:sqlite');
        const db = new DatabaseSync(dbPath, {
            allowExtension: true,
        });
        const extBasePath = resolve(__dirname, '../../db-exts');
        db.loadExtension(join(extBasePath, 'fts5'));
        db.loadExtension(join(extBasePath, 'spellfix1'));
        this.db = db;
    }
    exec(sql: string) {
        this.db.exec(sql);
    }
    createTable(createTableSQL: string) {
        this.exec(createTableSQL);
    }
    getAll(sql: string) {
        const query = this.db.prepare(sql);
        return query.all();
    }
    close() {
        this.db.close();
    }
}

const dbUtils = {
    getSQLiteDBInstance(dbName: string): SQLiteDatabase {
        return new SQLiteDatabase(dbName);
    },
};

export default dbUtils;
