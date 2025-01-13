export default class GarbageCollectableCacher<T> {
    private isClearing = false;
    private readonly _cache: Map<
        string,
        {
            value: T;
            timeout: number;
        }
    >;
    timeoutSecond: number;

    constructor(timeoutSecond: number) {
        this.timeoutSecond = timeoutSecond;
        this._cache = new Map();
    }

    delete(key: string) {
        this._cache.delete(key);
    }

    clear() {
        if (this.isClearing) {
            return;
        }
        this.isClearing = true;
        const now = Date.now();
        for (const [key, item] of this._cache.entries()) {
            if (item.timeout < now) {
                this._cache.delete(key);
            }
        }
        if (this._cache.size > 0) {
            setTimeout(this.clear.bind(this), 1000);
        }
        this.isClearing = false;
    }

    get(key: string) {
        const item = this._cache.get(key);
        if (item === undefined || item.timeout < Date.now()) {
            return null;
        }
        return item.value;
    }
    set(key: string, value: T) {
        this._cache.set(key, {
            value,
            timeout: Date.now() + this.timeoutSecond * 1000,
        });
        this.clear();
    }
}
