const DB_NAME = 'bible';

export type RecordType = {
    id: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
};
abstract class IndexedDbController {
    static _instance: IndexedDbController | null = null;
    static DB_VERSION = 3;
    abstract get storeName(): string;
    static instantiate(): IndexedDbController {
        throw new Error('Not implemented');
    }
    _db: IDBDatabase | null = null;
    get isDbInitialized() {
        return this._db !== null;
    }
    get db() {
        if (this._db === null) {
            throw new Error('DB is not initialized');
        }
        return this._db;
    }
    _initCallback<T>(target: any,
        resolve: (e: T) => void,
        reject: (e: string) => void) {
        target.onsuccess = function (event: T) {
            resolve(event);
        };
        target.onerror = function () {
            reject(this.error);
        };
    }
    _getTransaction(mode: IDBTransactionMode) {
        if (!this.db.objectStoreNames.contains(this.storeName)) {
            throw new Error(`Object store ${this.storeName} does not exist`);
        }
        const transaction = this.db.transaction([this.storeName], mode);
        const store = transaction.objectStore(this.storeName);
        return { store, transaction };
    }
    _createObjectStore() {
        if (this.db.objectStoreNames.contains(this.storeName)) {
            this.db.deleteObjectStore(this.storeName);
        }
        this.db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: false,
        });
    }
    init() {
        return new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.open(DB_NAME, 3);
            request.onupgradeneeded = (event: any) => {
                this._db = event.target.result;
                this._createObjectStore();
            };
            this._initCallback<Event>(request, (event: any) => {
                this._db = event.target.result;
                resolve();
            }, reject);
        });
    }
    async addItem(id: string, data: any, isForceOverride = false) {
        const oldData = await this.getItem(id);
        if (oldData !== undefined) {
            if (!isForceOverride) {
                throw new Error(`Item with id ${id} already exists`);
            }
            await this.deleteItem(id);
        }
        return new Promise<void>((resolve, reject) => {
            const { store } = this._getTransaction('readwrite');
            const request = store.add({
                id, data, ...{
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            this._initCallback(request, resolve, reject);
        });
    }
    getItem<T>(id: string) {
        return new Promise<(RecordType & { data: T }) | null>((resolve, reject) => {
            const { store } = this._getTransaction('readonly');
            const request = store.get(id);
            this._initCallback(request, (event: any) => {
                resolve(event.target.result || null);
            }, reject);
        });
    }
    deleteItem(id: string) {
        return new Promise<void>((resolve, reject) => {
            const { store } = this._getTransaction('readwrite');
            const request = store.delete(id);
            this._initCallback(request, resolve, reject);
        });
    }
    clearAllItems() {
        return new Promise<void>((resolve, reject) => {
            const { store } = this._getTransaction('readwrite');
            const request = store.clear();
            this._initCallback(request, resolve, reject);
        });
    }
    closeDb() {
        if (this._db !== null) {
            this._db.close();
            this._db = null;
        }
    }
    static async getInstance() {
        if (this._instance === null) {
            this._instance = this.instantiate();
            await this._instance.init();
        }
        return this._instance;
    }
}

export class BibleRefsDbController extends IndexedDbController {
    get storeName() {
        return 'bible_refs';
    }
    static instantiate() {
        return new this();
    }
}
