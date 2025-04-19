import { unlocking } from '../server/appHelpers';

type StoreType<T> = { value: T; timestamp: number };
export default class CacheManager<T> {
    private readonly cache: Map<string, StoreType<T>>;
    private readonly expirationSecond: number | null;

    constructor(expirationSecond: number | null = null) {
        this.cache = new Map();
        this.expirationSecond = expirationSecond;
        const cleanupSeconds = 5 * 1000; // 5 seconds
        setInterval(this.cleanup, cleanupSeconds);
    }

    unlocking<P>(key: string, callback: () => Promise<P>): Promise<P> {
        return unlocking<P>(`caching-${key}`, async () => {
            return await callback();
        });
    }

    checkIsExpired(item: StoreType<T>): boolean {
        if (this.expirationSecond === null) {
            return false;
        }
        return Date.now() - item.timestamp > this.expirationSecond * 1000;
    }

    private _cleanup(): void {
        for (const [key, item] of this.cache) {
            if (this.checkIsExpired(item)) {
                this.cache.delete(key);
            }
        }
    }

    async cleanup(): Promise<void> {
        await this.unlocking('cleanup', async () => {
            this._cleanup();
        });
    }

    async get(key: string): Promise<T | null> {
        return await this.unlocking(key, async () => {
            const cacheItem = this.cache.get(key);
            if (cacheItem) {
                if (this.checkIsExpired(cacheItem)) {
                    this.cache.delete(key);
                    return null;
                }
                cacheItem.timestamp = Date.now();
                return cacheItem.value;
            }
            return null;
        });
    }

    async set(key: string, value: T): Promise<void> {
        await this.unlocking(key, async () => {
            this.cache.set(key, { value, timestamp: Date.now() });
        });
    }
    clear(): void {
        this.cache.clear();
    }
}
