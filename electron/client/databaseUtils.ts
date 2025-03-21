/* eslint-disable @typescript-eslint/no-unused-vars */
import { join, resolve } from 'node:path';

import { isWindows, isMac, isArm64 } from '../electronHelpers';

// https://nodejs.org/docs/latest-v22.x/api/sqlite.html

class SQLiteDatabase {
    public database: any;
    constructor(databasePath: string) {
        const { DatabaseSync } = require('node:sqlite');
        const database = new DatabaseSync(databasePath, {
            allowExtension: true,
        });
        const extBasePath = resolve(__dirname, '../../db-exts');
        let suffix = '';
        if (isWindows) {
            suffix = '.dll';
        } else if (isMac && !isArm64) {
            suffix = '-int';
        }
        // database.loadExtension(join(extBasePath, `fts5${suffix}`));
        // database.loadExtension(join(extBasePath, `spellfix1${suffix}`));
        this.database = database;
    }
    exec(sql: string) {
        this.database.exec(sql);
    }
    createTable(createTableSQL: string) {
        this.exec(createTableSQL);
    }
    getAll(sql: string) {
        const query = this.database.prepare(sql);
        return query.all();
    }
    close() {
        this.database.close();
    }
}

const databaseUtils = {
    getSQLiteDatabaseInstance(databaseName: string): SQLiteDatabase {
        return new SQLiteDatabase(databaseName);
    },
};

export default databaseUtils;
