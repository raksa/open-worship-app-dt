import { Database } from 'sqlite3';

const sqlite3 = require('sqlite3');

export function openDB(dbFilePath: string) {
    return new Promise<Database>((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath,
            sqlite3.OPEN_READONLY, (error: any) => {
                if (error) {
                    console.log(error);
                    reject(new Error('Error during open db'));
                } else {
                    resolve(db);
                }
            });
    });
};

export function selectFrom(db: Database, table: string, key: string) {
    return new Promise(async (resolve) => {
        let callback = (value: string | null) => {
            callback = () => false;
            resolve(value);
        };
        if ((db as any).open) {
            db.serialize(() => {
                const sql = `SELECT key, value FROM ${table} WHERE key='${key}'`;
                db.each(sql, (error, row) => {
                    if (error) {
                        console.log(error);
                    } else {
                        callback(row.value);
                    }
                }, (error, row) => {
                    if (error) {
                        console.log(error);
                    }
                    if (!row) {
                        callback(null);
                    }
                });
            });
        } else {
            callback(null);
        }
    });
}

export function readValue(dbFilePath: string, table: string, key: string) {
    return new Promise((resolve) => {
        openDB(dbFilePath).then((db) => {
            selectFrom(db, table, key).then(resolve);
        }).catch((error) => {
            console.log(error);
            resolve(null);
        });
    });
}

