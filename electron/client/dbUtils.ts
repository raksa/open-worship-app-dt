// https://nodejs.org/docs/latest-v22.x/api/sqlite.html
// https://sqlite.org/howtocompile.html
// Build extension https://sqlite.org/loadext.html#build
// Full Text Search https://sqlite.org/fts5.html

// # Windows
// > nmake /f makefile.msc sqlite3.c
// > cl fts5.c /link -dll /out:fts5.dll
// # Mac
// > ./configure && make sqlite3.c
// > gcc -g -fPIC -dynamiclib fts5.c -o fts5.dylib
// # Unix-like
// > gcc -g -fPIC -shared fts5.c -m32 -o fts5.so
// # check dependencies
// > ldd fts5.so
// # 32-bit
// > sudo apt install gcc-multilib
// > gcc -g -fPIC -shared fts5.c -m32 -o x86_fts5.so

// SQLite3 version 3.49.1

class SQLiteDatabase {
    public db: any;
    constructor(dbPath: string, fts5ExtPath: string) {
        if (!dbPath || !fts5ExtPath) {
            throw new Error('dbPath and fts5ExtPath is required');
        }
        const { DatabaseSync } = require('node:sqlite');
        const db = new DatabaseSync(dbPath, {
            allowExtension: true,
        });
        db.loadExtension(fts5ExtPath);
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
    getSQLiteDBInstance(dbName: string, fts5ExtPath: string): SQLiteDatabase {
        return new SQLiteDatabase(dbName, fts5ExtPath);
    },
};

export default dbUtils;
