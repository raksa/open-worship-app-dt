import { unlocking } from '../server/appHelpers';

export default class CacheManager<T> {
    private readonly maxSize: number;
    private readonly cache: Map<string, { value: T; timestamp: number }>;
    private order: string[];
    private readonly expirationSecond: number | null;

    constructor(maxSize: number, expirationSecond: number | null = null) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.order = [];
        this.expirationSecond = expirationSecond;
    }

    unlocking<P>(key: string, callback: () => Promise<P>): Promise<P> {
        return unlocking<P>(`caching-${key}`, async () => {
            return await callback();
        });
    }

    async get(key: string): Promise<T | null> {
        return await this.unlocking(key, async () => {
            const cacheItem = this.cache.get(key);
            if (cacheItem) {
                const { value, timestamp } = cacheItem;
                if (
                    this.expirationSecond !== null &&
                    Date.now() - timestamp > this.expirationSecond * 1000
                ) {
                    this.cache.delete(key);
                    return null;
                }
                return value;
            }
            return null;
        });
    }

    async set(key: string, value: T): Promise<void> {
        await this.unlocking(key, async () => {
            if (this.cache.has(key)) {
                this.cache.delete(key);
                this.order = this.order.filter((k) => {
                    return k !== key;
                });
            } else if (this.order.length >= this.maxSize) {
                const oldestKey = this.order.shift();
                if (oldestKey) {
                    this.cache.delete(oldestKey);
                }
            }
            this.cache.set(key, { value, timestamp: Date.now() });
            this.order.push(key);
        });
    }
    clear(): void {
        this.cache.clear();
        this.order = [];
    }
}
