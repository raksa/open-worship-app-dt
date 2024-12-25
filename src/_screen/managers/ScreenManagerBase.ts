export default abstract class ScreenManagerBase {

    static readonly eventNamePrefix: string = 'screen-m';
    readonly screenId: number;

    constructor(screenId: number) {
        this.screenId = screenId;
    }

}
