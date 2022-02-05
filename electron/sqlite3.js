'use strict';

const sqlite3 = require('sqlite3');

const openDB = (dbFilePath) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath,
            sqlite3.OPEN_READONLY, (error) => {
                if (error) {
                    console.log(error);
                    reject(new Error('Error during open db'));
                } else {
                    resolve(db);
                }
            });
    });
};
const selectFrom = (db, table, key) => {
    return new Promise(async (resolve) => {
        let callback = (value) => {
            callback = () => { };
            resolve(value);
        };
        if (db.open) {
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
};
const readValue = (dbFilePath, table, key) => {
    return new Promise((resolve) => {
        openDB(dbFilePath).then((db) => {
            selectFrom(db, table, key).then(resolve);
        }).catch((error) => {
            console.log(error);
            resolve(null);
        });
    });
};

module.exports = {
    openDB,
    selectFrom,
    readValue,
};
