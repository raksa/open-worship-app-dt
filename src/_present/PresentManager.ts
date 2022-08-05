import PresentBGManager from './PresentBGManager';

export default class PresentManager {
    presentBGManager: PresentBGManager;
    static _cache: Map<string, PresentManager> = new Map();
    constructor() {
        this.presentBGManager = new PresentBGManager();
    }
    static getInstance(presentId: number) {
        const key = presentId + '';
        if (!this._cache.has(key)) {
            this._cache.set(key, new PresentManager());
        }
        return this._cache.get(key) as PresentManager;
    }
}
