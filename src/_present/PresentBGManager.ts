export type BackgroundType = 'color' | 'image' | 'video';
export type BackgroundSrcType = {
    type: BackgroundType;
    src: string;
};

export default class PresentBGManager {
    _bgSrc: BackgroundSrcType | null = null;
    get bgSrc() {
        return this._bgSrc;
    }
    set bgSrc(bgSrc: BackgroundSrcType | null) {
        this._bgSrc = bgSrc;
        this.fireUpdate();
    }
    fireUpdate: () => void = () => void 0;
}
