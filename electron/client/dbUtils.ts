import messageUtils from './messageUtils';

// https://nodejs.org/docs/latest-v22.x/api/sqlite.html
// Full Text Search https://sqlite.org/fts5.html

class SQLiteDatabase {
    public db: any;
    constructor(dbName: string) {
        if (!dbName) {
            throw new Error('dbName is required');
        }
        const { DatabaseSync } = require('node:sqlite');
        const userDataPath = messageUtils.sendDataSync(
            'main:app:get-data-path',
        );
        console.log(userDataPath);

        const db = new DatabaseSync(`${userDataPath}/${dbName}.db`, {
            allowExtension: true,
        });
        // wget -c https://www.sqlite.org/src/tarball/SQLite-trunk.tgz?uuid=trunk -O SQLite-trunk.tgz
        // tar -xzf SQLite-trunk.tgz
        // cd SQLite-trunk
        // ./configure --enable-fts5 && make
        // gcc -g -fPIC -dynamiclib fts5.c -o fts5.dylib
        // # /Users/raksa/Downloads/sqlite/SQLite-trunk/fts5.dylib
        // test.db.enableLoadExtension(true);
        db.loadExtension(
            '/Users/raksa/Downloads/sqlite/SQLite-trunk/fts5.dylib',
        );
        this.db = db;
    }
    exec(sql: string) {
        this.db.exec(sql);
    }
    // 'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)',
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
