
const DB_NAME = 'bible';
abstract class IndexDB {
    db: IDBDatabase | null = null;
    get store(): IDBObjectStore {
        if (this.db === null) {
            throw new Error('Fail to open IndexedDB');
        }
        const objectStore = this.db.transaction([this.storeName], 'readwrite')
            .objectStore(this.storeName);
        return objectStore;
    }
    abstract get storeName(): string;
    init() {
        return new Promise<void>((resolve, _reject) => {
            const reject = () => {
                _reject('Fail to open IndexedDB');
            };
            const request = indexedDB.open(DB_NAME, 3);
            request.onerror = (event) => {
                reject();
            };
            request.onsuccess = (event) => {
                if (event.target === null) {
                    return reject();
                };
                this.db = (event.target as any).result;
                resolve();
            };
        });
    }
    add(key: string, value: string) {
        return this.store.add({ key, value });
    }
    get(key: string) {
        return this.store.get(key);
    }
    update(key: string, value: string) {
        return this.store.put({ key, value });
    }
    delete(key: string) {
        return this.store.delete(key);
    }
}

export class BibleRefsIndexDB extends IndexDB {
    private static _instance: BibleRefsIndexDB | null = null;
    get storeName() {
        return 'bible_refs';
    }
    static async getInstance() {
        if (this._instance === null) {
            this._instance = new BibleRefsIndexDB();
            await this._instance.init();
        }
        return this._instance;
    }
}
