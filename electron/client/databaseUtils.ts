/* eslint-disable @typescript-eslint/no-unused-vars */
import { dirname, join, resolve } from 'node:path';
import { copyFileSync, existsSync } from 'node:fs';

import { isWindows, isMac, isArm64 } from '../electronHelpers';

// https://nodejs.org/docs/latest-v22.x/api/sqlite.html

function getLibFilePath(databasePath: string, libName: string) {
    const extBasePath = resolve(__dirname, '../../db-exts');
    let suffix = '';
    if (isWindows) {
        suffix = '.dll';
    } else if (isMac && !isArm64) {
        suffix = '-int';
    }
    const fileFullName = `${libName}${suffix}`;
    const libFilePath = join(extBasePath, fileFullName);
    const databaseBasePath = dirname(databasePath);
    const destLibFile = join(databaseBasePath, fileFullName);
    if (!existsSync(destLibFile)) {
        copyFileSync(libFilePath, destLibFile);
    }
    return destLibFile;
}

class SQLiteDatabase {
    public database: any;
    constructor(databasePath: string) {
        const { DatabaseSync } = require('node:sqlite');
        const database = new DatabaseSync(databasePath, {
            allowExtension: true,
        });
        const destLibFile = getLibFilePath(databasePath, 'fts5');
        database.loadExtension(destLibFile);
        // const destLibFile = getLibFilePath(databasePath, 'spellfix1');
        // database.loadExtension(destLibFile);
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
